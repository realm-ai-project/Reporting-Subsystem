import React, { Component } from 'react';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';
import classnames from 'classnames';
import {
  Breadcrumb,
  BreadcrumbItem,
  Card,
  CardBody,
  Col,
  Row,
  Button,
  CardHeader,
  CardFooter,
  CardImg,
  CardTitle,
  CardSubtitle,
  CardText,
  ButtonGroup,
  Progress,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
} from 'reactstrap';
import laptopImage from '../../assets/images/laptop.jpeg';
import { generateHeatmap } from '../../api';

class DisplayPage extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fileInput = React.createRef();

    this.toggle = this.toggle.bind(this);
    this.state = {
      activeTab: '1',
      progress: 40,
      params: {
        range_type: 'top',
        percentage: 0.01,
        dat_id: '1',
        file_path: 'data',
      },
      naiveImageList: [],
      byRewardImageList: [],
    };

    this.down = this.down.bind(this);
    this.up = this.up.bind(this);
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
      });
    }
  }

  down() {
    if (this.state.progress > 0) {
      this.setState(prevState => ({ progress: prevState.progress - 10 }));
    }
  }

  up() {
    if (this.state.progress < 100) {
      this.setState(prevState => ({ progress: prevState.progress + 10 }));
    }
  }

  // abstraction to let us set base64 image in react state
  async apiHandler(option, params) {
    let oldState = this.state;
    if (option == '1') {
      const responseJSON = await generateHeatmap(option, params);
      oldState.naiveImageList.push({ name: responseJSON.name, base64: responseJSON.base64 });
    } else if (option == '2') {
      oldState.params.percentage = this.state.progress / 100;
      const responseJSON = await generateHeatmap(option, params);
      oldState.byRewardImageList.push({ name: responseJSON.name, base64: responseJSON.base64 });
    }
    this.setState(oldState);
  }

  // for by reward
  createHeatmapOptionTwo() {
    // TODO, change params state based off UI params set
    let oldState = this.state;
    oldState.params.range_type = 'top'; // should be from user input
    oldState.params.percentage = this.state.progress / 100;
    oldState.params.dat_id = 1; // should be from user input
    //run api call
    this.setState(oldState);
    generateHeatmap(this.state.activeTab, this.state.params);
  }

  // TODO add error checking and validation for form inputs
  updateStateParams(option, dat_id) {
    let oldState = this.state;
    if (option == '1') {
      oldState.params.dat_id = dat_id; // should be from user input
    }
    this.setState(oldState);
  }

  updateFilePath(path) {
    let oldState = this.state;
    console.log(path);
    oldState.params.file_path = path;
    this.setState(oldState);
  }

  handleSubmit(event) {
    event.preventDefault();
    alert(`Selected file - ${this.fileInput.current.files[0].name}`);
    console.log(this.fileInput.current.files[0].webkitRelativePath.split('/')[0]);
    this.updateFilePath(this.fileInput.current.files[0].webkitRelativePath.split('/')[0]);
  }

  getFileInput() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Upload file:
          <input type="file" directory="" webkitdirectory="" ref={this.fileInput} />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
    );
  }

  render() {
    return (
      <div>
        <div>
          <Card>
            <CardBody>
              <Breadcrumb>
                <BreadcrumbItem>
                  <a href="#!">src</a>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <a href="#!">data</a>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <a href="#!">files</a>
                </BreadcrumbItem>
                <BreadcrumbItem active={true}>
                  <a href="#!">run3</a>
                </BreadcrumbItem>
              </Breadcrumb>
            </CardBody>
          </Card>
          {/* <FileInput /> */}
          {this.getFileInput()}
        </div>
        <Nav tabs>
          <NavItem>
            <NavLink
              href="#"
              className={classnames({ active: this.state.activeTab === '1' })}
              onClick={() => {
                this.toggle('1');
              }}
            >
              HeatMap Option 1
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              href="#"
              className={classnames({ active: this.state.activeTab === '2' })}
              onClick={() => {
                this.toggle('2');
              }}
            >
              HeatMap Option 2
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              href="#"
              className={classnames({ active: this.state.activeTab === '3' })}
              onClick={() => {
                this.toggle('2');
              }}
            >
              HeatMap Option
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              href="#"
              className={classnames({ active: this.state.activeTab === '4' })}
              onClick={() => {
                this.toggle('2');
              }}
            >
              HeatMap Option 4
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId="1">
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                onClick={() => this.apiHandler(this.state.activeTab, this.state.params)}
                size="sm"
                className="pull-right"
              >
                Generate Heatmap
              </Button>
              <input
                type="text"
                pattern="[0-9]*"
                onChange={event => this.updateStateParams(this.state.activeTab, event.target.value)}
                value={this.state.params.dat_id}
              />
            </div>
            <Row>
              {this.state.naiveImageList.map((imgObj, index) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'row' }}>
                  <Card>
                    <CardImg src={`data:image/png;base64,${imgObj.base64}`} style={{ flex: 1 }} />
                    <CardBody>
                      <CardTitle>{imgObj.name}</CardTitle>
                    </CardBody>
                  </Card>
                </div>
              ))}
              {/* {this.state.naiveImage ? <img src={`data:image/png;base64,${this.state.naiveImage}`} /> : ''} */}
              {/* <div style={{ textAlign: '-webkit-center' }}>
                  <Carousel width="30%">
                    <Card>
                      <CardImg src="/assets/gamescore.jpg" top width="100%" />
                      <CardBody>
                        <CardTitle>Iteration 1 : Gamescore</CardTitle>
                        <CardText>Top 10% </CardText>
                        <Button color="primary">Run Again</Button>
                      </CardBody>
                    </Card>
                    <Card>
                      <CardImg src="/assets/gamescore.jpg" top width="100%" />
                      <CardBody>
                        <CardTitle>Iteration 1 : Gamescore</CardTitle>
                        <CardText>Top 15% </CardText>
                        <Button color="primary">Run Again</Button>
                      </CardBody>
                    </Card>
                  </Carousel>
                </div> */}
            </Row>
          </TabPane>
          <TabPane tabId="2">
            <Card color="primary" outline>
              <CardHeader>Select Parameters</CardHeader>
              <input
                type="text"
                pattern="[0-9]*"
                onChange={event => this.updateStateParams(this.state.activeTab, event.target.value)}
                value={this.state.params.dat_id}
              />
              <CardBody>
                <Row>
                  <ButtonGroup className="m-b" style={{ paddingRight: '5px' }}>
                    <Button onClick={this.down}>Down</Button>
                    <Button onClick={this.up}>Up</Button>
                  </ButtonGroup>
                  <h4> Percentage: {this.state.progress} %</h4>
                </Row>
                <Progress className="m-b" value={this.state.progress} />
                <Button onClick={() => this.apiHandler(this.state.activeTab, this.state.params)} color="success">
                  Generate Heat Map
                </Button>
              </CardBody>
            </Card>
            <Row>
              {this.state.byRewardImageList.map((imgObj, index) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'row' }}>
                  <Card>
                    <CardImg src={`data:image/png;base64,${imgObj.base64}`} style={{ flex: 1 }} />
                    <CardBody>
                      <CardTitle>{imgObj.name}</CardTitle>
                    </CardBody>
                  </Card>
                </div>
              ))}
            </Row>
            {/* <Row>
              <Card outline color="secondary">
                <CardImg src="/assets/gamescore.jpg" top width="100%" />
                <CardBody>
                  <CardTitle>Iteration 1 : Gamescore</CardTitle>
                  <CardText>Top 10% </CardText>
                  <Button color="primary">Run Again</Button>
                </CardBody>
              </Card>
              <Card color="blue" outline>
                <CardImg src="/assets/gamescore.jpg" top width="100%" />
                <CardBody>
                  <CardTitle>Iteration 1 : Gamescore</CardTitle>
                  <CardText>Top 15% </CardText>
                  <Button color="primary">Run Again</Button>
                </CardBody>
              </Card>
            </Row> */}
          </TabPane>
          <TabPane tabId="3">
            <Row>
              <p>TODO: add component here</p>
            </Row>
          </TabPane>
          <TabPane tabId="4">
            <Row>
              <p>TODO: add component here</p>
            </Row>
          </TabPane>
        </TabContent>
      </div>
    );
  }
}

export default DisplayPage;
