import './App.css';
import { BrowserRouter as Router,Route,Switch } from "react-router-dom";
import Login from './components/Login';
import Register from './components/Register';
import Messenger from './components/Messenger';
import Messages from './components/Messages';
import ProtectRoute from './components/ProtectRoute';

function App() {
  return (
        <Router>
            <Switch>
                <Route path='/login' component={Login} exact></Route>
                <Route path='/register' component={Register} exact></Route>
                <ProtectRoute path='/' component={Messenger} exact />
                <ProtectRoute path='/messages/:userId' component={Messages} exact />
            </Switch>
        </Router>
  );
}

export default App;

