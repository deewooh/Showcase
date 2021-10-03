
import React, { Component } from "react";
import axiosInstance from "../axiosApi";

import logo from './logo.png'

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "", 
            password: "",
            errors: {},
        };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    async handleSubmit(e) {
        let ret = await this.props.handleLogin(e, this.state);
        //console.log(ret);
        if (ret) {
            this.setState({
                errors: ret
            })
        }
        //console.log(errors.detail)
    }

    // Login stylying from open source: https://www.positronx.io/build-react-login-sign-up-ui-template-with-bootstrap-4/
    render() {
        return ( 
            <form onSubmit={e => this.handleSubmit(e)}>
                <img
                    src={logo}
                    width="300"
                    height="auto"
                    className="d-inline-block align-top"
                    alt="Task Flow logo"
                />
                <h3>Login</h3>
                {/* Here we take in the "props given to us from App.js*/}
                <label className="invalid-input">
                    { this.state.errors.detail ? this.state.errors.detail : null}
                </label>
                <div className="form-group">
                    <label>Username/Email:</label>
                    <input 
                        name="username"
                        className="form-control"
                        type="text" 
                        value={this.state.username} 
                        onChange={this.handleChange}
                        placeholder="Enter Email"/>
                </div>

                <div className="form-group">
                    <label>Password:</label>
                        <input 
                            name="password" 
                            className="form-control"
                            type="password" 
                            value={this.state.password} 
                            onChange={this.handleChange}
                            placeholder="Enter Password"/>
                </div>

                <button type="submit" className="btn btn-blue btn-block" value="Submit">
                    Login
                </button>

                <p className="forgot-password text-right">
                        Sign up <a className="text-dblue" href="/taskflow/signup/">here</a>
                </p>
            </form>
        )
    }
}
export default Login;