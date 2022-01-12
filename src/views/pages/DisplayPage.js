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
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  FormGroup,
  Form,
  Input,
  Label,
} from 'reactstrap';
import { generateHeatmap, getAllVideos, playVideo, getAllHeatmaps } from '../../api';

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
        file_path: null,
      },
      tempFilePath: null,
      naiveImageList: [],
      byRewardImageList: [],
      modal: false,
      byEpisodeLengthList: [],
      byLastPositionList: [],
      videosList: [],
    };

    this.down = this.down.bind(this);
    this.up = this.up.bind(this);
    // this.toggle = this.toggle.bind(this);
  }

  handleChange = event => {
    this.setState({ tempFilePath: event.target.value });
  };

  toggleTab(tab) {
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
    if (option == '1' || option == '4') {
      const responseJSON = await generateHeatmap(option, params);
      if (option == '1') {
        oldState.naiveImageList.push({ name: responseJSON.name, base64: responseJSON.base64 });
      } else {
        oldState.byLastPositionList.push({ name: responseJSON.name, base64: responseJSON.base64 });
      }
    } else if (option == '2' || option == '3') {
      oldState.params.percentage = this.state.progress / 100;
      const responseJSON = await generateHeatmap(option, params);
      if (option == '2') {
        oldState.byRewardImageList.push({ name: responseJSON.name, base64: responseJSON.base64 });
      } else {
        oldState.byEpisodeLengthList.push({ name: responseJSON.name, base64: responseJSON.base64 });
      }
    }
    this.setState(oldState);
  }

  // TODO add error checking and validation for form inputs
  updateStateParamsDatId(dat_id) {
    let oldState = this.state;
    oldState.params.dat_id = dat_id;
    this.setState(oldState);
  }

  // TODO add error checking and validation for form inputs
  updateStateParamsRangeType(range_type) {
    let oldState = this.state;
    oldState.params.range_type = range_type;
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

  async openVideo(videoFileLocation) {
    await playVideo(videoFileLocation);
  }

  // function to handle file path modal button interaction
  async handleSelectDirectoryEvent(pressedSubmit) {
    if (pressedSubmit) {
      let oldState = this.state;
      oldState.params.file_path = this.state.tempFilePath;

      // clear old heatmaps and videos list
      this.state.naiveImageList = []
      this.state.byRewardImageList = []
      this.state.byEpisodeLengthList = []
      this.state.byLastPositionList = []
      this.state.videosList = []

      // Get all videos based on the file path
      const responseVideosJSON = await getAllVideos(this.state.params.file_path);
      oldState.videosList = responseVideosJSON
      this.setState(oldState);

      // Get all heatmaps based on file path
      const responseHeatmapsJSON = await getAllHeatmaps(this.state.params.file_path);
      console.log(responseHeatmapsJSON)
      responseHeatmapsJSON.naive.forEach((heatmapObj, index) => {
        oldState.naiveImageList.push({ name: heatmapObj.name, base64: heatmapObj.base64 })
      })
      responseHeatmapsJSON.reward.forEach((heatmapObj, index) => {
        oldState.byRewardImageList.push({ name: heatmapObj.name, base64: heatmapObj.base64 })
      })
      responseHeatmapsJSON.episode_length.forEach((heatmapObj, index) => {
        oldState.byEpisodeLengthList.push({ name: heatmapObj.name, base64: heatmapObj.base64 })
      })
      responseHeatmapsJSON.last_position.forEach((heatmapObj, index) => {
        oldState.byLastPositionList.push({ name: heatmapObj.name, base64: heatmapObj.base64 })
      })
      
      this.setState(oldState);

    } else {
      this.setState({ tempFilePath: this.state.params.file_path });
    }
    this.setState(prevState => ({
      modal: !prevState.modal,
    }));
  }

  // function to toggle modal state
  toggle() {
    this.setState({ tempFilePath: this.state.params.file_path });
    this.setState(prevState => ({
      modal: !prevState.modal,
    }));
  }

  render() {
    return (
      <div>
        <div>
          <Card>
            <CardBody>
              {/* <Breadcrumb>
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
              </Breadcrumb> */}
            </CardBody>
          </Card>
          <Button color="primary" onClick={this.toggle}>
            Select Directory Path
          </Button>
          <a target="_blank" href="https://www.tensorflow.org/tensorboard" style={{ textDecoration: 'none' }}>
            <Button color="success" outline className="mx-2">
              TensorBoard
            </Button>{' '}
          </a>
          <a target="_blank" href="https://wandb.ai/site" style={{ textDecoration: 'none' }}>
            <Button color="primary" outline>
              Weights and Biases
            </Button>{' '}
          </a>
          <Modal isOpen={this.state.modal} toggle={this.toggle}>
            <ModalHeader toggle={this.toggle}>Please Select Directory</ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label for="path">Path</Label>
                <Input
                  type="text"
                  name="path"
                  id="path"
                  placeholder="/Users/documents"
                  value={this.state.tempFilePath}
                  onChange={this.handleChange}
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={() => this.handleSelectDirectoryEvent(true)}>
                Submit
              </Button>{' '}
              <Button color="secondary" onClick={() => this.handleSelectDirectoryEvent(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>
        </div>
        <Card>
          <CardBody>
            <CardTitle>Selected Directory Path: </CardTitle>
            <CardText>
              <div>{this.state.params.file_path}</div>
            </CardText>
          </CardBody>
        </Card>
        <Nav tabs>
          <NavItem>
            <NavLink
              href="#"
              className={classnames({ active: this.state.activeTab === '1' })}
              onClick={() => {
                this.toggleTab('1');
              }}
            >
              Naive Heatmap
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              href="#"
              className={classnames({ active: this.state.activeTab === '2' })}
              onClick={() => {
                this.toggleTab('2');
              }}
            >
              Heatmaps by Reward
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              href="#"
              className={classnames({ active: this.state.activeTab === '3' })}
              onClick={() => {
                this.toggleTab('3');
              }}
            >
              Heatmaps by Episode Length
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              href="#"
              className={classnames({ active: this.state.activeTab === '4' })}
              onClick={() => {
                this.toggleTab('4');
              }}
            >
              Heatmaps by Agent Last Position
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId="1">
            <Form>
              <Row form>
                <Col md={2}>
                  <FormGroup>
                    <Label>dat_id</Label>
                    <Input
                      type="text"
                      pattern="[0-9]*"
                      onChange={event => this.updateStateParamsDatId(event.target.value)}
                      value={this.state.params.dat_id}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Button onClick={() => this.apiHandler(this.state.activeTab, this.state.params)}>Generate Heatmap</Button>
            </Form>
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
            <Form>
              <Row form>
                <Col md={2}>
                  <FormGroup>
                    <Label>dat_id</Label>
                    <Input
                      type="text"
                      pattern="[0-9]*"
                      onChange={event => this.updateStateParamsDatId(event.target.value)}
                      value={this.state.params.dat_id}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row form>
                <Col md={2}>
                  <FormGroup>
                    <Label>Range type</Label>
                    <Input
                      type="select"
                      onChange={event => this.updateStateParamsRangeType(event.target.value)}
                      value={this.state.params.range_type}
                    >
                      <option>top</option>
                      <option>bottom</option>
                    </Input>
                  </FormGroup>
                </Col>
              </Row>
              <Row form>
                <Col md={2}>
                  <FormGroup>
                    <Label>Percentage</Label>
                    <CardBody>
                      <Row>
                        <ButtonGroup className="m-b" style={{ paddingRight: '5px' }}>
                          <Button onClick={this.down}>Down</Button>
                          <Button onClick={this.up}>Up</Button>
                        </ButtonGroup>
                        <h4> {this.state.progress} %</h4>
                      </Row>
                      <Progress className="m-b" value={this.state.progress} />
                    </CardBody>
                  </FormGroup>
                </Col>
              </Row>
              <Button onClick={() => this.apiHandler(this.state.activeTab, this.state.params)}>Generate Heatmap</Button>
            </Form>
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
          </TabPane>
          <TabPane tabId="3">
            <Form>
              <Row form>
                <Col md={2}>
                  <FormGroup>
                    <Label>dat_id</Label>
                    <Input
                      type="text"
                      pattern="[0-9]*"
                      onChange={event => this.updateStateParamsDatId(event.target.value)}
                      value={this.state.params.dat_id}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row form>
                <Col md={2}>
                  <FormGroup>
                    <Label>Range type</Label>
                    <Input
                      type="select"
                      onChange={event => this.updateStateParamsRangeType(event.target.value)}
                      value={this.state.params.range_type}
                    >
                      <option>top</option>
                      <option>bottom</option>
                    </Input>
                  </FormGroup>
                </Col>
              </Row>
              <Row form>
                <Col md={2}>
                  <FormGroup>
                    <Label>Percentage</Label>
                    <CardBody>
                      <Row>
                        <ButtonGroup className="m-b" style={{ paddingRight: '5px' }}>
                          <Button onClick={this.down}>Down</Button>
                          <Button onClick={this.up}>Up</Button>
                        </ButtonGroup>
                        <h4> {this.state.progress} %</h4>
                      </Row>
                      <Progress className="m-b" value={this.state.progress} />
                    </CardBody>
                  </FormGroup>
                </Col>
              </Row>
              <Button onClick={() => this.apiHandler(this.state.activeTab, this.state.params)}>Generate Heatmap</Button>
            </Form>
            <Row>
              {this.state.byEpisodeLengthList.map((imgObj, index) => (
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
          </TabPane>
          <TabPane tabId="4">
            <Form>
              <Row form>
                <Col md={2}>
                  <FormGroup>
                    <Label>dat_id</Label>
                    <Input
                      type="text"
                      pattern="[0-9]*"
                      onChange={event => this.updateStateParamsDatId(event.target.value)}
                      value={this.state.params.dat_id}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Button onClick={() => this.apiHandler(this.state.activeTab, this.state.params)}>Generate Heatmap</Button>
            </Form>
            <Row>
              {this.state.byLastPositionList.map((imgObj, index) => (
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
          </TabPane>
        </TabContent>
        <div>
          <Card>
            <CardBody>
              <CardTitle>Videos: </CardTitle>
              {this.state.videosList.map((video) => 
                <button onClick={() => this.openVideo(video)}>{video}</button>)
              }
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }
}

export default DisplayPage;
