import './App.css';
import { HomeComponent } from './home/Home';

function App() {
  return (
    <div className="App" >
      <header>
        <h1 onClick={_ => window.location.reload()}>My Certificate</h1>
      </header>
      <section className="main-content">
        <div className="spacer"></div>
        <HomeComponent />
      </section>
      <footer>
        <div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
      </footer>
    </div>
  );
}

export default App;