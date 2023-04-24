import { useEffect, useState } from 'react'
import { db } from '../index'
import {
  getDocs,
  collection,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  updateDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import { Form } from 'react-bootstrap'
import '../css/MyRecipesPage.css'
import { v4 as uuid } from 'uuid'
import Pagination from '../components/Pagination'
export default function MyRecipesPage({ user, loading }) {
  const [recipeList, setRecipeList] = useState([])
  const [mealPlans, setMealPlans] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [selectedPlanner, setSelectedPlanner] = useState('default')
  const [newPlanner, setNewPlanner] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState({})
  const [addedToDb, setAddedToDb] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Read the data from db
  const recipeCollectionsRef = collection(db, 'recipes')
  const mealPlansRef = collection(db, 'mealplans')
  // get current displayed posts
  const resultsPerPage = 10
  const indexOfLastResult = currentPage * resultsPerPage
  const indexOfFirstResult = indexOfLastResult - resultsPerPage
  const currentResults = recipeList.slice(indexOfFirstResult, indexOfLastResult)

  const getRecipeList = async () => {
    const q = query(
      recipeCollectionsRef,
      //if user anth is done, uncomment the next line
      where('user_id', '==', user.uid),
      orderBy('createdAt', 'desc'),
    )
    try {
      const data = await getDocs(q)
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }))
      // Set the recipe list
      console.log(filteredData)
      setRecipeList(filteredData)
    } catch (err) {
      console.log(err)
    }
  }

  const getMealPlans = async () => {
    try {
      const data = await getDocs(mealPlansRef)
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }))
      setMealPlans(filteredData)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    getRecipeList()
    getMealPlans()
  }, [loading])

  const deleteRecipe = async (id) => {
    const recipeDoc = doc(db, 'recipes', id)
    await deleteDoc(recipeDoc)
    getRecipeList()
  }

  const handleShowAdd = (recipe) => {
    setShowAdd(true)
    setSelectedRecipe(recipe)
    setAddedToDb('')
  }

  const handleHideAdd = () => {
    setShowAdd(false)
    setSelectedPlanner('default')
    setNewPlanner('')
  }

  const handleChangeExisting = (e) => {
    setSelectedPlanner(e.target.value)
    setNewPlanner('')
  }

  const handleChangeNew = (e) => {
    setNewPlanner(e.target.value)
    setSelectedPlanner('default')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setShowAdd(false)
    if (selectedPlanner !== 'default') {
      // for adding to existing db
      const recipeId = uuid()
      const mealPlansDoc = doc(db, 'mealplans', selectedPlanner)
      const tempState = mealPlans.filter(
        (mealPlan) => mealPlan.id === selectedPlanner,
      )[0]
      tempState.columns['Monday'].recipe_ids.push(recipeId)
      tempState.recipes = {
        ...tempState.recipes,
        [recipeId]: {
          ...selectedRecipe,
          db_id: selectedRecipe.id,
          id: recipeId,
        },
      }
      console.log(selectedRecipe)
      await updateDoc(mealPlansDoc, tempState)
      setAddedToDb(`Added to new meal plan: ${tempState.name}`)
      setSelectedPlanner('default')
      setNewPlanner('')
    } else {
      // for adding to new db
      const recipeId = uuid()
      try {
        await addDoc(mealPlansRef, {
          name: newPlanner,
          column_order: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
          columns: {
            Monday: {
              id: uuid(),
              day: 'Monday',
              recipe_ids: [recipeId],
            },
            Tuesday: { id: uuid(), day: 'Tuesday', recipe_ids: [] },
            Wednesday: { id: uuid(), day: 'Wednesday', recipe_ids: [] },
            Thursday: { id: uuid(), day: 'Thursday', recipe_ids: [] },
            Friday: { id: uuid(), day: 'Friday', recipe_ids: [] },
            Saturday: { id: uuid(), day: 'Saturday', recipe_ids: [] },
            Sunday: { id: uuid(), day: 'Sunday', recipe_ids: [] },
          },
          recipes: {
            [recipeId]: {
              ...selectedRecipe,
              db_id: selectedRecipe.id,
              id: recipeId,
            },
          },
          // user: 1, // use userid or username
          created_at: serverTimestamp(),
        })
        getMealPlans()
        setSelectedPlanner('default')
        setNewPlanner('')
        setAddedToDb(`Added to new meal plan: ${newPlanner}`)
      } catch (err) {
        console.log(err)
      }
    }
  }

  const paginate = (pageNumber, e) => {
    e.preventDefault()
    setCurrentPage(pageNumber)
  }

  return (
    <section className="myrecipes-section">
      <h1>My recipes</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {currentResults.length === 0 ? (
            <p>No Saved Recipes.</p>
          ) : (
            <div className="container">
              {currentResults.map((recipe) => {
                return (
                  <div key={recipe.id} className="ui-card-myrecipes">
                    <h1>{recipe.name}</h1>
                    <img src={recipe.image} alt="" />
                    <p>{recipe.createdAt.toDate().toLocaleDateString()}</p>
                    <p>{recipe.createdAt.toDate().toLocaleTimeString()}</p>
                    <button onClick={() => deleteRecipe(recipe.id)}>
                      Delete Recipe
                    </button>
                    <button onClick={() => handleShowAdd(recipe)}>
                      Add to a meal plan
                    </button>
                    {addedToDb && recipe === selectedRecipe ? (
                      <span>{addedToDb}</span>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
      <Modal show={showAdd} onHide={handleHideAdd} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>
            Which meal planner do you want to add <i>{selectedRecipe.name}</i>
            to?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Text>Save into existing meal plan</Form.Text>
              <Form.Select
                aria-label="Default select example"
                onChange={handleChangeExisting}
                value={selectedPlanner}
              >
                <option value="default">Pick meal plan</option>
                {mealPlans?.map((mealPlan, index) => (
                  <option key={index} value={mealPlan.id}>
                    {mealPlan.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Text>Save into new meal plan</Form.Text>
              <Form.Control
                onChange={handleChangeNew}
                type="text"
                placeholder="Enter new meal plan name"
                value={newPlanner}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={(e) => handleSubmit(e)}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
      <Pagination
        resultsPerPage={resultsPerPage}
        totalResults={recipeList.length}
        paginate={paginate}
      ></Pagination>
    </section>
  )
}
