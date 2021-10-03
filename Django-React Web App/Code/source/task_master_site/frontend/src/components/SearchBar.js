import React, { Component } from "react";
import {
    Button,
    Form,
    FormGroup,
    Row,
    Col,
    Input,
    Label,

    Collapse,
    CardBody,
    Card,
} from "reactstrap";

export default class SearchBar extends Component  {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            description: "",
            id: "",
            start_date: "",
            end_date: "",

            isOpen: false,
        };

        this.handleChange = this.handleChange.bind(this)
    }

    // Update the state of search parameters when there is a change
    handleChange = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    }

    // Function executes when the form is submitted using the Enter key
    submitForm = (e) => {
        e.preventDefault();
        this.props.onSave(this.state);
    }

    toggleAdvancedSearch = () => {
        this.setState({ isOpen: !this.state.isOpen });
        console.log(this.state.isOpen);
    }

    render() {
    const { onSave } = this.props;

    const tw = 2;   // Text width for the form

    return (
        <Form onSubmit={(e) => this.submitForm(e)}>
            <FormGroup>
                <Row>
                    <Col xs={tw} sm={tw} lg={tw} xl={tw}>
                        <Label for="search-name">Name</Label>
                    </Col>
                    <Col>
                        <Input
                            type="text"
                            id="search-name"
                            name="name"
                            value={this.state.name}
                            onChange={this.handleChange}
                            placeholder="Task Name"
                        />
                    </Col>
                </Row>
            </FormGroup>

            <Collapse isOpen={this.state.isOpen}>
                <FormGroup>
                    <Row>
                        <Col xs={tw} sm={tw} lg={tw} xl={tw}>
                            <Label for="search-description">Description</Label>
                        </Col>
                        <Col>
                            <Input
                                type="text"
                                id="search-description"
                                name="description"
                                value={this.state.description}
                                onChange={this.handleChange}
                                placeholder="Task Description"
                            />
                        </Col>
                    </Row>
                </FormGroup>
                <FormGroup>
                    <Row>
                        <Col xs={tw} sm={tw} lg={tw} xl={tw}>
                            <Label for="search-id">ID</Label>
                        </Col>
                        <Col>
                            <Input
                                type="number"
                                id="search-id"
                                name="id"
                                value={this.state.id}
                                onChange={this.handleChange}
                                placeholder="Task ID"
                            />
                        </Col>
                    </Row>
                </FormGroup>
                <FormGroup>
                    <Row>
                        <Col xs={tw} sm={tw} lg={tw} xl={tw}>
                            <Label for="search-start-date">Start Date</Label>
                        </Col>
                        <Col>
                            <Input
                                type="date"
                                id="search-start-date"
                                name="start_date"
                                value={this.state.start_date}
                                onChange={this.handleChange}
                                placeholder="Task Start Date"
                            />
                        </Col>
                    </Row>
                </FormGroup>
                <FormGroup>
                    <Row>
                        <Col xs={tw} sm={tw} lg={tw} xl={tw}>
                            <Label for="search-end-date">End Date</Label>
                        </Col>
                        <Col>
                            <Input
                                type="date"
                                id="search-end-date"
                                name="end_date"
                                value={this.state.end_date}
                                onChange={this.handleChange}
                                placeholder="01/01/2021"
                            />
                        </Col>
                    </Row>
                </FormGroup>
            </Collapse>
            <Button
                className="btn btn-blue mr-3"
                onClick={() => onSave(this.state)}
            >
                Search
            </Button>
            <Button
                className="btn btn-blue"
                onClick={this.toggleAdvancedSearch}
            >
                Advanced Search
            </Button>
        </Form>
    );
    }
}