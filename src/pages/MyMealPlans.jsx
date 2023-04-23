import { useEffect, useState } from 'react'
import { Card, Row, Col, Form } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { db } from '../index'
import {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { v4 as uuid } from 'uuid'

export default function MyMealPlans({ user, loading }) {
import '../css/MyMealPlans.css'
export default function MyMealPlans() {
  const [mealPlans, setMealPlans] = useState([])
  const [showAddPlan, setShowAddPlan] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [selectedId, setSelectedId] = useState('')

  const navigate = useNavigate()
  if (!loading && !user) navigate('/login')

  const mealPlansRef = collection(db, 'mealplans')

  const getMealPlans = async () => {
    const q = query(
      mealPlansRef,
      where('user_id', '==', user.uid),
      orderBy('created_at', 'desc'),
    )
    try {
      const data = await getDocs(q)
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
    getMealPlans()
  }, [])

  const handleShowAddPlan = () => setShowAddPlan(true)
  const handleHideAddPlan = () => {
    setShowAddPlan(false)
    setSelectedPlan('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setShowAddPlan(false)
    try {
      await addDoc(mealPlansRef, {
        name: selectedPlan,
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
          Monday: { id: uuid(), day: 'Monday', recipe_ids: [] },
          Tuesday: { id: uuid(), day: 'Tuesday', recipe_ids: [] },
          Wednesday: { id: uuid(), day: 'Wednesday', recipe_ids: [] },
          Thursday: { id: uuid(), day: 'Thursday', recipe_ids: [] },
          Friday: { id: uuid(), day: 'Friday', recipe_ids: [] },
          Saturday: { id: uuid(), day: 'Saturday', recipe_ids: [] },
          Sunday: { id: uuid(), day: 'Sunday', recipe_ids: [] },
        },
        recipes: {}, // contains id: {id: ... name: ... } maybe whole thing from my recipes?
        user_id: user.uid, // use userid or username
        created_at: serverTimestamp(),
      })
      getMealPlans()
    } catch (err) {
      console.log(err)
    }
  }

  const handleDeletePrompt = (name, id) => {
    setShowDelete(true)
    setSelectedPlan(name)
    setSelectedId(id)
  }

  const handleDelete = async (e) => {
    e.preventDefault()
    setShowDelete(false)
    const mealPlansDoc = doc(db, 'mealplans', selectedId)
    await deleteDoc(mealPlansDoc)
    getMealPlans()
    setSelectedId('')
  }

  return (
    <section className="myplans-sections">
      <h1>Your Meal Plans</h1>
      <Row xs={1} md={4} className="ui-cards-section">
        {mealPlans?.map((mealPlan) => (
          <Col key={mealPlan.id} className="ui-card">
            <div>
              <Card className="mealplans">
                <Card.Body>
                  <Link to={`/my-meal-plans/${mealPlan.id}`}>
                    <Card.Title>{mealPlan.name}</Card.Title>
                    <Card.Text>Add text here?</Card.Text>
                  </Link>
                  {/* <Button> Go to meal plan</Button> */}
                  <Button
                    className="delete-btn"
                    onClick={() =>
                      handleDeletePrompt(mealPlan.name, mealPlan.id)
                    }
                  >
                    Delete
                  </Button>
                </Card.Body>
              </Card>
            </div>
          </Col>
        ))}
      </Row>
      <div>
        <Button onClick={handleShowAddPlan}>Add Meal Plan</Button>
      </div>
      <Modal show={showAddPlan} onHide={handleHideAddPlan} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>What do you want to name your mealplan?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Control
                onChange={(e) => setSelectedPlan(e.target.value)}
                type="text"
                placeholder="Enter Meal Planner name"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showDelete} onHide={() => setShowDelete(false)}>
        <Modal.Header>
          <Modal.Title>
            Are you sure you want to delete this meal plan?
          </Modal.Title>
        </Modal.Header>
        <div>
          <Modal.Body>
            <h4>{selectedPlan}</h4>
          </Modal.Body>
        </div>
        <Modal.Footer>
          <Button onClick={(e) => handleDelete(e)}>Yes</Button>
          <Button onClick={() => setShowDelete(false)}>No</Button>
        </Modal.Footer>
      </Modal>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Row xs={1} md={4}>
            {mealPlans?.map((mealPlan) => (
              <Col key={mealPlan.id}>
                <div className="mealplans">
                  <Card>
                    <Card.Body>
                      <Link to={`/my-meal-plans/${mealPlan.id}`}>
                        <Card.Title>{mealPlan.name}</Card.Title>
                        <Card.Text>Add text here?</Card.Text>
                      </Link>
                      {/* <Button> Go to meal plan</Button> */}
                      <Button
                        className="delete-btn"
                        onClick={() =>
                          handleDeletePrompt(mealPlan.name, mealPlan.id)
                        }
                      >
                        Delete
                      </Button>
                    </Card.Body>
                  </Card>
                </div>
              </Col>
            ))}
          </Row>
          <div>
            <Button onClick={handleShowAddPlan}>Add Meal Plan</Button>
          </div>
          <Modal
            show={showAddPlan}
            onHide={handleHideAddPlan}
            backdrop="static"
          >
            <Modal.Header closeButton>
              <Modal.Title>What do you want to name your mealplan?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Control
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    type="text"
                    placeholder="Enter Meal Planner name"
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleSubmit}>
                Submit
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal show={showDelete} onHide={() => setShowDelete(false)}>
            <Modal.Header>
              <Modal.Title>
                Are you sure you want to delete this meal plan?
              </Modal.Title>
            </Modal.Header>
            <div>
              <Modal.Body>
                <h4>{selectedPlan}</h4>
              </Modal.Body>
            </div>
            <Modal.Footer>
              <Button onClick={(e) => handleDelete(e)}>Yes</Button>
              <Button onClick={() => setShowDelete(false)}>No</Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </section>
  )
}
