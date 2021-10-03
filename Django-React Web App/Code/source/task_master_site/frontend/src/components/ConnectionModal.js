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
      activeItem: this.props.activeItem,
    };
  }

  handleChange = (e) => {
    let { name, value } = e.target;

    if (e.target.type === "checkbox") {
      value = e.target.checked;
    }

    const activeItem = { ...this.state.activeItem, [name]: value};

    this.setState({ activeItem });
  };

  render() {
    const { toggle, onSave } = this.props;

    return (
        // Styling for the Modal component:
      <Modal isOpen={true} toggle={toggle}>
        <ModalHeader toggle={toggle}>Add Connection</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="task-title">Username</Label>
              <Input
                type="text"
                id="receiver_userID"
                name="receiver"
                value={this.state.activeItem.name}
                onChange={this.handleChange}
                placeholder="Enter Receiver Username"
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button
            color="success"
            onClick={() => onSave(this.state.activeItem)}
          >
            Add
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}