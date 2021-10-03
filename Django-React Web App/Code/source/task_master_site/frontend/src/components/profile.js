import React, { Component } from "react";
import axiosInstance from "../axiosApi";

import Tab from 'react-bootstrap/Tab';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Form,
    FormGroup,
    Input,
    Label,
    FormText,
} from "reactstrap";

class UserProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            //message:"",
            // Used to handle profile details change
            username:"",
            password:"",
            //workload:"",

            //Used to handle password change
            new_password:"",
            new_password2:"",
            old_password:"",

            // Error to handler
            errors:{},

            modal: false,
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.refresh_page =this.refresh_page.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        //this.getMessage = this.getMessage.bind(this)

    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    refresh_page(){
        location.reload();
    }

    async handleUpdate(event, data) {
        event.preventDefault();
        let success = false;
        try {
            const response = await axiosInstance.put(`/update_profile/${this.props.data.user_id}/`, {
                username: this.state.username,
                password: this.state.password,
            });
            success = true;
            this.setState({
                username: response.data.username,
                errors: response.data,
            })
            this.props.handleLogin(event, this.state);
            //return response;
        } catch (error) {
            if (error.response) {
                this.setState({errors: error.response.data});
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('Error', error.message);
            }
        } finally {
            if(success){
                location.reload();
            }
        }
    };

    // Function to handle password change
    async handlePasswordChange(event, data) {
        event.preventDefault();
        let success = false;
        try {
            const response = await axiosInstance.put(`/update_password/${this.props.data.user_id}/`, {
                old_password: this.state.old_password,
                password: this.state.new_password,
                password2: this.state.new_password2,
            });
            success = true;
        } catch (error) {
            if (error.response) {
                this.setState({errors: error.response.data});
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('Error', error.message);
            }
        } finally {
            if(success){
                location.reload();
            }
        }
    };

    // Function that handles when the user clicks the button to delete account
    async handleDelete(event){
        event.preventDefault();
        try {
            const response = await axiosInstance.delete(`/delete_user/${this.props.data.user_id}/`, {});
            this.props.handleLogout(event);
        } catch (error) {
            if (error.response) {
                this.setState({errors: error.response.data});
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('Error', error.message);
            }
        } 
    }


    toggleViewModal = () => {
        if(this.state.modal === true){
            this.setState({ modal: false });
        } else {
            this.setState({ modal: true });
        }
        console.log(this.state.modal)
      };


    render_modal() {
        if(this.state.modal === true){
            return(
                <Modal isOpen={true} toggle={this.toggleViewModal}>
                    <ModalHeader toggle={this.toggleViewModal}>Confirm Delete</ModalHeader>
                    <ModalBody>
                        <p>Deleting this account will cause all tasks assigned to you to disappear
                        and all your account information to be deleted from TaskFlow</p>
                        <button onClick={this.handleDelete} className="btn btn-primary btn-block btn-red">
                            Delete Account
                        </button>
                    </ModalBody>
                    <ModalFooter>
                    </ModalFooter>
                </Modal>
            );
        } else {
            return null;
        }
    }


    componentDidMount(){
        //this.getWorkload(this.props.data.user_id)
    }

    render(){
        return (
            <div>

                <h3>Profile: {this.props.data.username}</h3>
                <Tab.Container id="left-tabs" defaultActiveKey="first">
                    <Row >
                        <Col sm={3}>
                            <Nav variant="pills" className="flex-column">
                                <Nav.Item className="profileNav">
                                    <Nav.Link className="text-dblue profile" eventKey="first">Update Email</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link className="text-dblue profile" eventKey="second">Change Password</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link className="text-dblue profile" eventKey="third">Delete Account</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                        <Col sm={9}>
                            <Tab.Content>
                                    <Tab.Pane eventKey="first">
                                        <form onSubmit={this.handleUpdate} className="profile-container">
                                        <h3>Change Details</h3>

                                        <div className="form-group">
                                            <label>New Email</label>
                                            <input 
                                                name="username"
                                                className="form-control profile_input" 
                                                type="email" 
                                                value={this.state.username} 
                                                onChange={this.handleChange}
                                                placeholder="Enter new Email"/>
                                            <label className="invalid-input">
                                                { this.state.errors.username ? this.state.errors.username : null}
                                            </label>
                                        </div>
                                        <div className="form-group">
                                            <label>Confirm Password:</label>
                                            <p>Enter current password to confirm changes</p>
                                            <input 
                                                name="password" 
                                                className="form-control profile_input"
                                                type="password" 
                                                value={this.state.password} 
                                                onChange={this.handleChange}
                                                placeholder="Enter Password"/>
                                            <label className="invalid-input">
                                                { this.state.errors.password ? this.state.errors.password : null}
                                            </label>
                                        </div>
                                        <button type="submit" className="btn btn-primary btn-block" value="Submit">
                                            Update Details
                                        </button>
                                    </form>
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="second">
                                        <form onSubmit={this.handlePasswordChange} className="profile-container">
                                            <h3>Change Password</h3>

                                            <div className="form-group">
                                                <label>New Password:</label>
                                                <input 
                                                    name="new_password" 
                                                    className="form-control"
                                                    type="password" 
                                                    value={this.state.new_password} 
                                                    onChange={this.handleChange}
                                                    placeholder="Enter Password"/>
                                                <label className="invalid-input">
                                                    { this.state.errors.password ? this.state.errors.password : null}
                                                </label>
                                            </div>

                                            <div className="form-group">
                                                <label>Confirm Password:</label>
                                                <input 
                                                    name="new_password2" 
                                                    className="form-control"
                                                    type="password" 
                                                    value={this.state.new_password2} 
                                                    onChange={this.handleChange}
                                                    placeholder="Confirm Password"/>
                                                <label className="invalid-input">
                                                    { this.state.errors.password2 ? this.state.errors.password2 : null}
                                                </label>
                                            </div>

                                            <div className="form-group">
                                                <label>Old Password:</label>
                                                <p>Enter old password to confirm changes</p>
                                                <input 
                                                    name="old_password" 
                                                    className="form-control"
                                                    type="password" 
                                                    value={this.state.old_password} 
                                                    onChange={this.handleChange}
                                                    placeholder="Enter Password"/>
                                                <label className="invalid-input">
                                                    { this.state.errors.old_password ? this.state.errors.old_password : null}
                                                </label>
                                            </div>
                                            <button type="submit" className="btn btn-primary btn-block" value="Submit">
                                                Update Password
                                            </button>
                                        </form>
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="third">
                                        <div className="profile-container">
                                            <h3>Delete Account</h3>
                                            <button onClick={this.toggleViewModal} className="btn btn-primary btn-block btn-red">
                                                Delete Account
                                            </button>
                                        </div>
                                        <div>
                                            {this.render_modal()}
                                        </div>
                                    </Tab.Pane>
                            </Tab.Content>
                        </Col>
                    </Row>
                </Tab.Container>
            </div>


        )
    }
}

export default UserProfile;