import './App.css';
import { HomeComponent } from './home/Home';

function App() {
    return ( 
    <div className = "App" >
      <header>
        <h1 onClick={_ => window.location.reload()}>My Vaccine My Photo</h1>
      </header>
      <div className="spacer"></div>
      <HomeComponent />
    </div>
    );
}

export default App;