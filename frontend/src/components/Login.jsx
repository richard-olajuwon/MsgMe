import React, { useState, useEffect } from 'react'
import { Link } from "react-router-dom";
import { userLogin } from "../store/actions/authAction";
import { useDispatch, useSelector } from "react-redux";
import { useAlert } from "react-alert";
import { ERROR_CLEAR, SUCCESS_MESSAGE_CLEAR } from "../store/types/authType";
const Login = ({ history }) => {

    const alert = useAlert();
    const { loading, successMessage, error, authenticate, myInfo } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const [state, setState] = useState({
        email: '',
        password: ''
    });

    const [isloading, setIsLoading] = useState(false);

    const handleInput = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        })
    }

    const login = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const loginResponse = await dispatch(userLogin(state))
        if(loginResponse.success === 'false'){
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (authenticate) {
            history.push('/')
        }
        if (successMessage) {
            alert.success(successMessage);
            dispatch({ type: SUCCESS_MESSAGE_CLEAR })
        }
        if (error) {
            error.map(err => alert.error(err));
            dispatch({ type: ERROR_CLEAR })
        }
    }, [successMessage, error])
    return (
        <div className="login">
            <div className="card">
                <div className="card-header">
                    <h3>Login</h3>
                </div>
                <div className="card-body">
                    <form onSubmit={login}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input onChange={handleInput} type="email" placeholder="email" value={state.email} name="email" id="email" className="form-control" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input onChange={handleInput} value={state.password} type="password" name="password" id="password" placeholder="password" className="form-control" />
                        </div>
                        <div className="form-group">
                            <input type="submit" value={isloading ? 'Logging In...' : 'Login'} className="btn" disabled = {isloading} />
                        </div>
                        <div className="form-group">
                            <span><Link to="/messenger/register">Register Your Account</Link></span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login
