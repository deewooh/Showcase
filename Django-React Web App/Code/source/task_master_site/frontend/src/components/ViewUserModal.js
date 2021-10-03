import React, { Component } from "react";
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

import moment from 'moment'

export default class CustomModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
        workload: props.workload,
        username: props.username,
        tasks: props.tasks
    }
  }

  showDeadline(item) {
    if (item.deadline === null){
      return ("No Deadline")
    } else {
      return (moment(item.deadline).format('DD MMM YYYY hh:mm a'))
    }
  }

  render_tasks() {
    return this.state.tasks.map((item) => (
      <li
        key={item.id}
        className="list-group-item d-flex justify-content-between align-items-center"
      >
        <span>
          {item.name}
        </span>
        <span className="task-col">
          {this.showDeadline(item)}
        </span>
      </li>
    ));
  }

  render() {
    const {toggle} = this.props;
    return (
      <Modal isOpen={true} toggle={toggle}>
        <ModalHeader toggle={toggle}>User: {this.state.username}</ModalHeader>
        <ModalBody>
          <h3>Workload: {this.state.workload}%</h3>
          {this.render_tasks()}
        </ModalBody>
        <ModalFooter>
        </ModalFooter>
      </Modal>
    );
  }
}