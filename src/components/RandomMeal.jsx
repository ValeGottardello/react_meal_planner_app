import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const options = [
  'chicken',
  'beef',
  'fish',
  'tofu',
  'soup',
  'pasta',
  'curry',
  'ramen',
]

const randomQuery = options[Math.floor(Math.random() * options.length)]

export default function RandomMeal() {
  const [randomMeals, setRandomMeals] = useState([])

  useEffect(() => {
    const url = `https://api.edamam.com/search?q=${randomQuery}&app_id=${process.env.REACT_APP_EDAMAM_APP_ID}&app_key=${process.env.REACT_APP_EDAMAM_API_KEY}&random=true&from=0&to=3`

    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        setRandomMeals(res.hits)
      })
  }, [])

  return (
    <section className="random">
      <h3>random Meals</h3>
      {randomMeals.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <>
          {randomMeals.map((meal, index) => {
            const uri = meal.recipe.uri
            const id = uri.substring(uri.indexOf('_') + 1, uri.length)
            return (
              <div key={index}>
                <Link to={`/recipes/${id}`}>
                  <h2>{meal.recipe.label}</h2>
                  <img src={meal.recipe.image} alt="" />
                </Link>
              </div>
            )
          })}
        </>
      )}
    </section>
  )
}
