import React, { Component, getState } from "react";
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
  FormFeedback,
} from "reactstrap";

import moment from 'moment'
import axiosInstance from "../axiosApi";

export default class CustomModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activeItem: this.props.activeItem,
      nameError: "",
      descriptionError: "",
      stateError: "",
      assigneeError: "",
      datetimeError: "",
      durationError: "",
      connectionsUserList: [],
      currentUser: null,
    };
  }

  componentDidMount() {
    this.refreshConnectionsList();
    this.getUser();
  }

  refreshConnectionsList = (id) => {
    axiosInstance
      .get("/connections/")
      .then((res) => this.setState({ connectionsUserList: res.data }))
      .catch((err) => console.log(err));
      console.log(this.state.connectionsUserList);
  };

  getUser = (id) => {
    axiosInstance
      .get("/current/")
      .then((res) => this.setState({ currentUser: res.data }))
      .catch((err) => console.log(err));
  };



  handleChange = (e) => {
    let { name, value } = e.target;
    if (e.target.type === "checkbox") {
      value = e.target.checked;
    }

    const activeItem = { ...this.state.activeItem, [name]: value};

    this.setState({ activeItem });
    //this.setState({activeItem.deadline = moment(activeItem.deadline_date + " " + activeItem.deadline_time)})
  };


  // Submit form if there are no errors
  checkFormAndSubmit = () => {
    if (this.state.nameError.length === 0
      && this.state.descriptionError.length === 0
      && this.state.stateError.length === 0
      && this.state.assigneeError.length === 0
      && this.state.datetimeError.length === 0
      && this.state.durationError.length === 0) {
        this.props.onSave(this.state.activeItem);
    }
  }

  handleSubmit = () => {

    const { name, description, state, assigned_to, deadline_date, deadline_time, duration } = this.state.activeItem;

    // Perform form validation for name
    if (!name) {
      this.setState(
        {
          nameError: "Task name is required"
        },
        // Note: The difficulty arises because setState() is an asynchronous function.
        // To overcome this, this arrow function is only called after the state has been updated.
        // This ensures the form is checked using the updated error values.
        () => {
          console.log("Updated name", this.state.nameError);
          this.checkFormAndSubmit();
          // Only check and submit for this field to avoid creating multiple identical tasks in one go
        }
      );
    } else {
      this.setState(
        {
          nameError: ""
        },
        () => {
          console.log('Updated name', this.state.nameError);
          this.checkFormAndSubmit();
          // Only check and submit for this field to avoid creating multiple identical tasks in one go
        }
      );
    }

    // Perform form validation for description
    if (!description) {
      this.setState(
        {
          descriptionError: "Task description is required"
        },
        () => {
          console.log('Updated description', this.state.descriptionError);
        }
      );
    } else {
      this.setState(
        {
          descriptionError: ""
        },
        () => {
          console.log('Updated description', this.state.descriptionError);
        }
      );
    }

    // Perform form validation for state (not to be confused with this.state)
    if (!state || state === "Not Selected") {
      this.setState(
        {
          stateError: "Task state is required"
        },
        () => {
          console.log('Updated state', this.state.stateError);
        }
      );
    } else {
      this.setState(
        {
          stateError: ""
        },
        () => {
          console.log('Updated state', this.state.stateError);
        }
      );
    }

    // Note: To be used when Assigned To becomes a dropdown list, instead of ID. Let the default option have a value of "Not Selected".
    // Perform form validation for assigned to
    if (!assigned_to || assigned_to === "Not Selected") {
      this.setState(
        {
          assigneeError: "Task assignee is required"
        },
        () => {
          console.log('Updated assignee', this.state.assigneeError);
        }
      );
    } else {
      this.setState(
        {
          assigneeError: ""
        },
        () => {
          console.log('Updated assignee', this.state.assigneeError);
        }
      );
    }

    // Perform form validation for date and time
    const date_valid = (!deadline_date || deadline_date === "Invalid date") ? false : true;
    const time_valid = (!deadline_time || deadline_time === "Invalid date") ? false : true;

    // console.log("date_valid", date_valid, "time_valid", time_valid);
    // console.log("deadline_date", deadline_date, "deadline_time", deadline_time);
    if (!date_valid && !time_valid) {
      // No date or time specified, acceptable
      this.setState(
        {
          datetimeError: ""
        },
        () => {
          console.log('Updated datetime', this.state.datetimeError);
        }
      );
    } else if ((date_valid && !time_valid) || (!date_valid && time_valid)) {
      this.setState(
        {
          datetimeError: "Both a date and a time must be specified"
        },
        () => {
          console.log('Updated datetime', this.state.datetimeError);
        }
      );
    } else {

      // console.log("Deadline = " + moment(deadline_date + " " + deadline_time));
      // console.log("moment() = " + moment());

      if (moment(deadline_date + " " + deadline_time).isBefore(moment())) {
        this.setState(
          {
            datetimeError: "Deadline must be after the current time"
          },
          () => {
            console.log('Updated datetime', this.state.datetimeError);
          }
        );
      } else {
        this.setState(
          {
            datetimeError: ""
          },
          () => {
            console.log('Updated datetime', this.state.datetimeError);
          }
        );
      }
    }

    // Perform form validation for duration
    // If duration is an integer, or a string that can be represented as an integer, and the int it represents is > 0
    if ((parseInt(duration, 10) === duration || parseInt(duration, 10).toString() === duration) && parseInt(duration, 10) > 0 ) {
      this.setState(
        {
          durationError: ""
        },
        () => {
          console.log('Updated duration', this.state.durationError);
        }
      );
    } else {
      this.setState(
        {
          durationError: "Duration must be a positive integer"
        },
        () => {
          console.log('Updated duration', this.state.durationError);
        }
      );
    }
  }


  renderConnections = () => {
    if (!this.state.connectionsUserList) {
      
      return [];
    }

    var arr = this.state.connectionsUserList.filter((item) => item.status == true);
    //arr = arr.filter((item) => (item.receiver == this.state.currentUser.id || item.sender == this.state.currentUser.id));
    arr = arr.filter((item) => (item.receiver == this.props.data.user_id || item.sender == this.props.data.user_id))
    
    // if user is receiver, add sender to list
    // if user is sender, add receiver to list
    // add user themselves to list

    // var arrNew = [];
    // for (var i=0; i < arr.length; i++) {
    //   if (arr[i].receiver == this.state.currentUser.id)  {
    //     arrNew.push(arr[i].sender)
    //     // push user onto their too, but only once
    //     if (i==0) {
    //       arrNew.push(arr[i].receiver)
    //     }
    //   }
    //   else if (arr[i].sender == this.state.currentUser.id)  {
    //     arrNew.push(arr[i].receiver)
    //     if (i==0) {
    //       arrNew.push(arr[i].sender)
    //     }
    //   }
    //}

    return arr.map((item) => (
      <option key={item.id} value={item.receiver == this.props.data.user_id ? item.sender : item.receiver} > {item.receiver == this.props.data.user_id ? item.sender_username : item.receiver_username} </option>
    ));

     // arr = arr.filter((item) => (item.receiver == this.props.data.user_id || item.sender == this.props.data.user_id))
     
      // {item.receiver == this.props.data.user_id ? item.sender_username : item.receiver_username}
              
    
    
    // from here I think we need to create a new array with a list of the actual users, 
    // potentially using the AnyUser view? to get each user based on their id

    
  }


  render() {
    const { toggle } = this.props;

    return (
        // Styling for the Modal component:
        // TODO: Change the assigned_to to a dropdown menu which has list of connections
        // rather than a input field.
        // add in durations field
      <Modal isOpen={true} toggle={toggle}>
        <ModalHeader toggle={toggle}>Task Item</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="task-title"><b>Name</b></Label>
              <Input
                invalid = {this.state.nameError.length > 0}
                type="text"
                id="task-name"
                name="name"
                value={this.state.activeItem.name}
                onChange={this.handleChange}
                placeholder="Enter task name"
              />
              {this.state.nameError.length > 0 && (
                <FormFeedback>{ this.state.nameError }</FormFeedback>
              )}
            </FormGroup>
            <FormGroup>
              <Label for="task-description"><b>Description</b></Label>
              <Input
                invalid = {this.state.descriptionError.length > 0}
                type="text"
                id="task-description"
                name="description"
                value={this.state.activeItem.description}
                onChange={this.handleChange}
                placeholder="Enter task description"
              />
              {this.state.descriptionError.length > 0 && (
                <FormFeedback>{ this.state.descriptionError }</FormFeedback>
              )}
            </FormGroup>
            <FormGroup>
              <Label for="exampleSelect"><b>State</b></Label>
              <Input
                invalid = {this.state.stateError.length > 0}
                type="select"
                id = "task-state" 
                name="state"
                onChange={this.handleChange}
                value={this.state.activeItem.state}
              >
                <option value="Not Selected">Select State</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Blocked">Blocked</option>
                <option value="Completed">Completed</option>
              </Input>
              {this.state.stateError.length > 0 && (
                <FormFeedback>{ this.state.stateError }</FormFeedback>
              )}
            </FormGroup>
            <FormGroup>
              <Label for="assigned_to"><b>Assigned To</b></Label>
              <FormText>You may assign the task to yourself or your connections.</FormText>
              <Input 
                    type="select"
                    id = "assigned_to" 
                    name="assigned_to"
                    //onSelect={this.handleChange}
                    onChange={this.handleChange}
                    value={this.state.activeItem.assigned_to}
                    invalid = {this.state.assigneeError.length > 0}
                >
                  <option value="Not Selected" > Select user </option>
                  <option value={this.props.data.user_id} > Yourself </option>
                  {this.renderConnections()}

                </Input>
              {this.state.assigneeError.length > 0 && (
                <FormFeedback>{ this.state.assigneeError }</FormFeedback>
              )}
            </FormGroup>
            
            <FormGroup>
              <Label for="deadline"><b>Deadline Date</b></Label>
              <Input
                invalid = {this.state.datetimeError.length > 0}
                type="date"
                id="deadline_date"
                name="deadline_date"
                value={this.state.activeItem.deadline_date}
                onChange={this.handleChange}
                placeholder="01/01/2021"
              />
              {this.state.datetimeError.length > 0 && (
                <FormFeedback>{ this.state.datetimeError }</FormFeedback>
              )}
            </FormGroup>

            <FormGroup>
              <Label for="deadline"><b>Deadline Time</b></Label>
              <Input
                invalid = {this.state.datetimeError.length > 0}
                type="time"
                id="deadline_time"
                name="deadline_time"
                value={this.state.activeItem.deadline_time}
                onChange={this.handleChange}
              />
              {this.state.datetimeError.length > 0 && (
                <FormFeedback>{ this.state.datetimeError }</FormFeedback>
              )}
            </FormGroup>
            
            <FormGroup>
              <Label for="duration"><b>Duration</b></Label>
              <FormText>Number of hours required to complete the task.</FormText>
              <Input
                invalid = {this.state.durationError.length > 0}
                type="text"
                id="task-duration"
                name="duration"
                value={this.state.activeItem.duration}
                onChange={this.handleChange}
                placeholder="Duration"
              />
              {this.state.durationError.length > 0 && (
                <FormFeedback>{ this.state.durationError }</FormFeedback>
              )}
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button
            className="btn btn-blue"
            onClick={this.handleSubmit}
          >
            Save
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}