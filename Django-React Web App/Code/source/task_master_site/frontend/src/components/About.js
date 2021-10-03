import React, { Component } from "react";


export default class About extends Component {
  constructor(props) {
    super(props)
    this.state = {
      message: "",
    };
  }

  render() {
    return (
        <div>
            <h2> Welcome to TaskFlow</h2>

            <h3>What is TaskFlow?</h3>
            <p>In the real world, managing numerous tasks and their deadlines is 
                difficult, resulting in incomplete tasks and missed deadlines. 
                As well as this, there is the issue of distributing these tasks 
                fairly across a team, accounting for how busy each individual is. 
                Therefore, the problem we are solving is the issue of tracking 
                several tasks simultaneously and distributing tasks amongst a 
                diverse team. The main objective of TaskFlow is to provide a 
                platform to manage tasks effectively and distribute tasks efficiently. 
            </p>

            <p>Have fun and enjoy using our platform. :)</p>
            <p>- TaskFlow Team</p>

        </div>
    );
  }
}