import TopBar from '../components/TopBar'
import MainLanding from '../components/MainLanding'

const LandingPage = () => {
  return (
    <div>
      <TopBar title={"Logistics & Dispatch Management System"} desc={"Effortlessly coordinate orders, drivers, and vehicles through a single, unified dispatch administration matrix"} role={"Guest"}/>
      <MainLanding />
    </div>
  )
}

export default LandingPage
