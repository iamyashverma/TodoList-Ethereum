import React, { Component } from 'react';
import TodoList from './contracts/TodoList.json';
import getWeb3 from './getWeb3';
import {
  Navbar,
  Container,
  Form,
  Button,
  Row,
  Col,
  Table,
  Alert,
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import './App.css';

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    account: null,
    contract: null,
    totalCount: 0,
    listItems: [],
    alert: { show: false },
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = TodoList.networks[networkId];
      const instance = new web3.eth.Contract(
        TodoList.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, account: accounts[0], contract: instance });
      this.showList();
      this.state.contract.events.ItemAdded().on('data', (event) => {
        this.showNotification(
          'Task has been added to your Todo-List',
          'success'
        );
      });
      this.state.contract.events.TaskCompleted().on('data', (event) => {
        var text = `Task ${event.returnValues.id} has been marked - ${
          event.returnValues.completed === true ? 'Completed' : 'To be done'
        }`;
        this.showNotification(text, 'success');
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  showList = async () => {
    const totalCount = await this.state.contract.methods.getTotalCount().call();
    if (totalCount > 0) {
      var listItems = [];
      for (var i = 0; i < totalCount; i++) {
        var item = await this.state.contract.methods.getItem(i + 1).call();
        listItems.push({ id: item[0], text: item[1], isCompleted: item[2] });
      }
    }
    this.setState({ totalCount, listItems });
  };

  toggleComplete = async (e, _id) => {
    e.preventDefault();
    var id = _id;
    await this.state.contract.methods
      .toggleCompleted(id)
      .send({ from: this.state.account });
    await this.showList();
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    var text = e.currentTarget[0].value;
    await this.state.contract.methods
      .addItem(text)
      .send({ from: this.state.account });
    e.target[0].value = '';
    await this.showList();
  };

  showNotification = (text, variant) => {
    this.setState({ alert: { show: true, text, variant } });
    setInterval(() => {
      this.setState({ alert: { show: false } });
    }, 5000);
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className='App'>
        <div>
          <Navbar bg='dark' variant='dark'>
            <Container>
              <Navbar.Brand href='#'>
                Ethereum Based Blockchain Todo-List
              </Navbar.Brand>
              <Navbar.Toggle />
              <Navbar.Collapse className='justify-content-end'>
                <Navbar.Text>
                  Signed in as: <a href='#'>{this.state.account}</a>
                </Navbar.Text>
              </Navbar.Collapse>
            </Container>
          </Navbar>
          {this.state.alert.show && this.state.alert.show === true && (
            <Alert
              variant={this.state.alert.variant}
              style={{
                zIndex: '20',
                transform: 'translate(0,20%)',
                width: '50%',
                margin: 'auto',
              }}
            >
              <Alert.Heading>{this.state.alert.text}</Alert.Heading>
            </Alert>
          )}
          <Container fluid='md'>
            <Row>
              <Col>
                <Form onSubmit={this.handleSubmit}>
                  <Form.Group className='mb-3'>
                    <Form.Control
                      type='text'
                      style={{
                        width: '20%',
                        margin: '20px auto 10px auto',
                        display: 'inline-block',
                      }}
                      placeholder='Enter Task Here'
                    />
                    <Button variant='primary' type='submit'>
                      Submit
                    </Button>
                  </Form.Group>
                </Form>
              </Col>
            </Row>
            <Row>
              <Col>
                <Container>Your Todo List Items </Container>
                <Container>
                  {this.state.totalCount > 0 ? (
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Completed</th>
                          <th>Task</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.listItems.map((item, index) => {
                          return (
                            <tr key={item.id} style={{ width: '10%' }}>
                              <td>
                                <input
                                  type='checkbox'
                                  checked={item.isCompleted}
                                  onChange={(e) => {
                                    this.toggleComplete(e, item.id);
                                  }}
                                />
                              </td>
                              <td style={{ width: '90%', textAlign: 'left' }}>
                                {item.isCompleted ? (
                                  <strike>{item.text}</strike>
                                ) : (
                                  item.text
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  ) : (
                    'List Empty ! Add Some Tasks'
                  )}
                </Container>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    );
  }
}

export default App;
