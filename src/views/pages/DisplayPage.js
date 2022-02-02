import React, { Component } from 'react';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';
import classnames from 'classnames';
import {
  Alert,
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
  Collapse,
} from 'reactstrap';

import { Accordion } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Slider from '@mui/material/Slider';
import {
  generateHeatmap,
  getAllVideos,
  playVideo,
  getAllHeatmaps,
  isValidDirectory,
  getRecentlySelectedDirectories,
  getTenserboardHost,
} from '../../api';

class DisplayPage extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fileInput = React.createRef();
    this.toggle = this.toggle.bind(this);
    this.updatePercentage = this.updatePercentage.bind(this);
    this.expandImage = this.expandImage.bind(this);
    this.closeImageModal = this.closeImageModal.bind(this);
    this.state = {
      loadingTenserboard: false,
      loadingNaiveHeatmap: false,
      loadingByRewardHeatmap: false,
      loadingByEpisodeLengthHeatmap: false,
      loadingByLastPositionHeatmap: false,
      directoryErrorVisible: false,
      directoryError: '',
      activeTab: '1',
      progress: 40,
      params: {
        range_type: 'top',
        percentage: 0.01,
        dat_id: '1',
        file_path: '',
      },
      tempFilePath: '',
      naiveImageList: [],
      byRewardImageList: [],
      modal: false,
      byEpisodeLengthList: [],
      byLastPositionList: [],
      videosList: [],
      videoFilesList: [],
      recentlySelectedDirectories: [],
      isDirectorySelected: false,
      selectedImage: null,
    };

    this.down = this.down.bind(this);
    this.up = this.up.bind(this);
    this.dismissDirectoryError = this.dismissDirectoryError.bind(this);
    this.onClickTenserboardButton = this.onClickTenserboardButton.bind(this);
    this.apiHandler = this.apiHandler.bind(this);
  }

  dismissDirectoryError() {
    this.setState({ directoryErrorVisible: false, directoryError: '' });
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

  updatePercentage(event) {
    this.setState({ progress: event.target.value });
  }

  // check if heatmap is already created and in list, if it does return the index, otherwise return -1
  checkHeatmapExistsInMemory(heatmapName, arr) {
    for (var i = 0; i < arr.length; i++) {
      if (heatmapName == arr[i].name) {
        return i;
      }
    }
    return -1;
  }

  // explicitly used in apiHandler, to invoke a callback for manipulating spinners
  updateHeatmapImageListWithData(responseJSON, imageList) {
    // given response, check if heatmap returned already exists in image list
    let newHeatmapObj = { name: responseJSON.name, base64: responseJSON.base64, created_at: responseJSON.created_at };
    let existingIndex = this.checkHeatmapExistsInMemory(responseJSON.name, imageList);
    if (existingIndex >= 0) {
      imageList[existingIndex] = newHeatmapObj;
    } else {
      imageList.push(newHeatmapObj);
    }
  }

  // toast notification functionsq
  toastSuccess = (heatmap_file_name, timestamp) =>
    toast.success('Succesfully generated ' + heatmap_file_name + ' on ' + timestamp);

  toastError = (heatmap_file_name, error) => toast.error('Error generating ' + heatmap_file_name + ': ' + error);

  async apiHandler() {
    let option = this.state.activeTab;
    let params = this.state.params;

    if (option == '1') {
      this.setState({ loadingNaiveHeatmap: true }, () => {
        generateHeatmap(option, params).then(responseJSON => {
          if (responseJSON.hasOwnProperty('error')) {
            this.toastError(responseJSON.name, responseJSON.error);
          } else {
            this.updateHeatmapImageListWithData(responseJSON, this.state.naiveImageList);
            this.toastSuccess(responseJSON.name, responseJSON.created_at);
          }
          this.setState({ loadingNaiveHeatmap: false });
        });
      });
    }
    if (option == '2') {
      this.state.params.percentage = this.state.progress / 100;
      this.setState({ loadingByRewardHeatmap: true }, () => {
        generateHeatmap(option, params).then(responseJSON => {
          if (responseJSON.hasOwnProperty('error')) {
            this.toastError(responseJSON.name, responseJSON.error);
          } else {
            this.updateHeatmapImageListWithData(responseJSON, this.state.byRewardImageList);
            this.toastSuccess(responseJSON.name, responseJSON.created_at);
          }
          this.setState({ loadingByRewardHeatmap: false });
        });
      });
    }
    if (option == '3') {
      this.state.params.percentage = this.state.progress / 100;
      this.setState({ loadingByEpisodeLengthHeatmap: true }, () => {
        generateHeatmap(option, params).then(responseJSON => {
          if (responseJSON.hasOwnProperty('error')) {
            this.toastError(responseJSON.name, responseJSON.error);
          } else {
            this.updateHeatmapImageListWithData(responseJSON, this.state.byEpisodeLengthList);
            this.toastSuccess(responseJSON.name, responseJSON.created_at);
          }
          this.setState({ loadingByEpisodeLengthHeatmap: false });
        });
      });
    }
    if (option == '4') {
      this.setState({ loadingByLastPositionHeatmap: true }, () => {
        generateHeatmap(option, params).then(responseJSON => {
          if (responseJSON.hasOwnProperty('error')) {
            this.toastError(responseJSON.name, responseJSON.error);
          } else {
            this.updateHeatmapImageListWithData(responseJSON, this.state.byLastPositionList);
            this.toastSuccess(responseJSON.name, responseJSON.created_at);
          }
          this.setState({ loadingByLastPositionHeatmap: false });
        });
      });
    }
  }

  async onClickTenserboardButton() {
    this.setState({ loadingTenserboard: true }, async () => {
      const responseValidDirectoryJSON = await isValidDirectory(this.state.params.file_path);
      if (responseValidDirectoryJSON.isDirectory == false) {
        this.setState({
          directoryErrorVisible: true,
          directoryError: responseValidDirectoryJSON.error,
          loadingTenserboard: false,
        });
        return;
      }
      getTenserboardHost(this.state.params.file_path).then(responseJSON => {
        this.setState({ loadingTenserboard: false });
        window.open(responseJSON.localHost);
      });
    });
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

  // Opens Modal with the image not truncated
  expandImage(base64image) {
    console.log(base64image);
    this.setState({ selectedImage: base64image });
  }

  closeImageModal() {
    this.setState({ selectedImage: null });
  }

  async openVideo(videoFileLocation) {
    await playVideo(videoFileLocation);
  }

  fillInPathWithSelectedRecentDirectory(directory) {
    this.setState({ tempFilePath: directory });
  }

  // function to handle file path modal button interaction
  async handleSelectDirectoryEvent(pressedSubmit) {
    if (pressedSubmit) {
      let oldState = this.state;
      oldState.params.file_path = this.state.tempFilePath;

      // clear old heatmaps and videos list
      this.state.naiveImageList = [];
      this.state.byRewardImageList = [];
      this.state.byEpisodeLengthList = [];
      this.state.byLastPositionList = [];
      this.state.videosList = [];
      this.state.videoFilesList = [];

      // check if valid directory, we need to make a backend call since the frontend can't access our file system
      const responseValidDirectoryJSON = await isValidDirectory(this.state.params.file_path);
      if (responseValidDirectoryJSON.isDirectory == false) {
        // show error popup
        this.setState({ directoryErrorVisible: true, directoryError: responseValidDirectoryJSON.error });
      } else {
        oldState.directoryErrorVisible = false;
        oldState.directoryError = '';
        // Get all videos based on the file path
        const responseVideosJSON = await getAllVideos(this.state.params.file_path);
        oldState.videosList = responseVideosJSON.fullPaths;
        oldState.videoFilesList = responseVideosJSON.fileNames;
        this.setState(oldState);

        // Get all heatmaps based on file path
        const responseHeatmapsJSON = await getAllHeatmaps(this.state.params.file_path);
        responseHeatmapsJSON.naive.forEach((heatmapObj, index) => {
          oldState.naiveImageList.push({
            name: heatmapObj.name,
            base64: heatmapObj.base64,
            created_at: heatmapObj.created_at,
          });
        });
        responseHeatmapsJSON.reward.forEach((heatmapObj, index) => {
          oldState.byRewardImageList.push({
            name: heatmapObj.name,
            base64: heatmapObj.base64,
            created_at: heatmapObj.created_at,
          });
        });
        responseHeatmapsJSON.episode_length.forEach((heatmapObj, index) => {
          oldState.byEpisodeLengthList.push({
            name: heatmapObj.name,
            base64: heatmapObj.base64,
            created_at: heatmapObj.created_at,
          });
        });
        responseHeatmapsJSON.last_position.forEach((heatmapObj, index) => {
          oldState.byLastPositionList.push({
            name: heatmapObj.name,
            base64: heatmapObj.base64,
            created_at: heatmapObj.created_at,
          });
        });
        this.setState(oldState);
      }
    } else {
      this.setState({ tempFilePath: this.state.params.file_path });
    }
    this.setState(prevState => ({
      modal: !prevState.modal,
    }));
    if (this.state.tempFilePath != null) {
      this.setState(prevState => ({
        isDirectorySelected: true,
      }));
    }
  }

  // function to toggle modal state
  async toggle() {
    // Get recently selected directories
    let directories = [];
    directories = await getRecentlySelectedDirectories();
    this.state.recentlySelectedDirectories = directories.recent_directories;

    this.setState({ tempFilePath: this.state.params.file_path });
    this.setState(prevState => ({
      modal: !prevState.modal,
    }));
  }

  render() {
    let directorySelected;
    if (this.state.isDirectorySelected) {
      directorySelected = (
        <Card>
          <CardBody>
            <CardTitle>Selected Directory Path: </CardTitle>
            <hr />
            <CardText>
              <div>{this.state.params.file_path}</div>
            </CardText>
          </CardBody>
        </Card>
      );
    }
    return (
      <div>
        <div>
          <ToastContainer
            position="top-right"
            autoClose={false}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            style={{ width: 'fit-content' }}
          />
          <Button color="primary" onClick={this.toggle}>
            Select Directory Path
          </Button>
          <a target="_blank" style={{ textDecoration: 'none' }}>
            <Button
              color="warning"
              className="m-2"
              onClick={this.onClickTenserboardButton}
              disabled={this.state.loadingTenserboard}
            >
              {this.state.loadingTenserboard && <i class="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i>}
              TensorBoard
            </Button>{' '}
          </a>
          <a target="_blank" href="https://wandb.ai/site" style={{ textDecoration: 'none' }}>
            <Button color="success" className="my-2">
              Weights and Biases
            </Button>{' '}
          </a>
          <Modal isOpen={this.state.modal} toggle={this.toggle}>
            <ModalHeader toggle={this.toggle}>Please Select Directory</ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label for="path" className="mb-2">
                  Path
                </Label>
                <Input
                  type="text"
                  name="path"
                  id="path"
                  placeholder="/Users/documents"
                  value={this.state.tempFilePath}
                  onChange={this.handleChange}
                />
              </FormGroup>
              <br />
              <Accordion>
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Recently Selected Directories</Accordion.Header>
                  <Accordion.Body>
                    {this.state.recentlySelectedDirectories.map(directory => (
                      <Button
                        color="primary"
                        outline
                        onClick={() => this.fillInPathWithSelectedRecentDirectory(directory)}
                      >
                        {directory}
                      </Button>
                    ))}
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
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
        <Alert color="danger" isOpen={this.state.directoryErrorVisible} toggle={this.dismissDirectoryError}>
          {this.state.directoryError}, please input a valid directory.
        </Alert>
        {directorySelected}
        {!this.state.isDirectorySelected && (
          <Card className="my-4">
            <CardBody>
              <CardTitle tag="h1">Welcome to RealmAI</CardTitle>
              <hr />
              Select a directory to start!
            </CardBody>
          </Card>
        )}
        {this.state.isDirectorySelected && (
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
        )}
        {this.state.isDirectorySelected && (
          <TabContent activeTab={this.state.activeTab}>
            <TabPane tabId="1">
              <Col md={3}>
                <Button onClick={this.apiHandler} disabled={this.state.loadingNaiveHeatmap}>
                  {this.state.loadingNaiveHeatmap && <i class="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i>}
                  Generate Heatmap
                </Button>
              </Col>
              <Row>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {this.state.naiveImageList.map((imgObj, index) => (
                    <div key={index}>
                      <Card onClick={() => this.expandImage(`data:image/png;base64,${imgObj.base64}`)}>
                        <CardImg
                          src={`data:image/png;base64,${imgObj.base64}`}
                          style={{
                            minHeight: '10%',
                            maxHeight: 500,
                            cursor: 'pointer',
                          }}
                        />
                        <CardBody>
                          <CardTitle tag="h4">{imgObj.name}</CardTitle>
                          <CardSubtitle className="text-muted" tag="h5">
                            {imgObj.created_at}
                          </CardSubtitle>
                        </CardBody>
                      </Card>
                    </div>
                  ))}
                </div>
                <Modal isOpen={this.state.selectedImage} toggle={this.closeImageModal}>
                  <Card>
                    <CardImg
                      src={this.state.selectedImage}
                      style={{
                        minHeight: '10%',
                        cursor: 'pointer',
                      }}
                    />
                    <CardBody />
                  </Card>
                </Modal>
              </Row>
            </TabPane>
            <TabPane tabId="2">
              <Form>
                <Row form>
                  <Col md={3}>
                    <FormGroup>
                      <Label className="mb-2">Range type</Label>
                      <Input
                        type="select"
                        onChange={event => this.updateStateParamsRangeType(event.target.value)}
                        value={this.state.params.range_type}
                        className="mb-2"
                      >
                        <option>top</option>
                        <option>bottom</option>
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>
                <Row form>
                  <Col md={3}>
                    <FormGroup>
                      <Label className="mb-2">Percentage</Label>
                      <CardBody className="mb-2">
                        <Row>
                          <Slider
                            onChange={this.updatePercentage}
                            defaultValue={30}
                            step={10}
                            marks
                            min={10}
                            max={100}
                            valueLabelDisplay="on"
                            className="mt-2"
                          />
                        </Row>
                      </CardBody>
                    </FormGroup>
                  </Col>
                </Row>
                <Button onClick={this.apiHandler} disabled={this.state.loadingByRewardHeatmap}>
                  {this.state.loadingByRewardHeatmap && <i class="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i>}
                  Generate Heatmap
                </Button>
              </Form>
              <Row>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {this.state.byRewardImageList.map((imgObj, index) => (
                    <div key={index}>
                      <Card onClick={() => this.expandImage(`data:image/png;base64,${imgObj.base64}`)}>
                        <CardImg
                          src={`data:image/png;base64,${imgObj.base64}`}
                          style={{ flex: 1, minHeight: '10%', maxHeight: 500, cursor: 'pointer' }}
                        />
                        <CardBody>
                          <CardTitle tag="h4">{imgObj.name}</CardTitle>
                          <CardSubtitle className="text-muted" tag="h5">
                            {imgObj.created_at}
                          </CardSubtitle>
                        </CardBody>
                      </Card>
                    </div>
                  ))}
                </div>
              </Row>
            </TabPane>
            <TabPane tabId="3">
              <Form>
                <Row form>
                  <Col md={3}>
                    <FormGroup>
                      <Label className="mb-2">Range type</Label>
                      <Input
                        type="select"
                        onChange={event => this.updateStateParamsRangeType(event.target.value)}
                        value={this.state.params.range_type}
                        className="mb-2"
                      >
                        <option>top</option>
                        <option>bottom</option>
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>
                <Row form>
                  <Col md={3}>
                    <FormGroup>
                      <Label className="mb-2">Percentage</Label>
                      <CardBody className="mb-2">
                        <Row>
                          <Slider
                            onChange={this.updatePercentage}
                            defaultValue={30}
                            step={10}
                            marks
                            min={10}
                            max={100}
                            valueLabelDisplay="on"
                            className="mt-2"
                          />
                        </Row>
                      </CardBody>
                    </FormGroup>
                  </Col>
                </Row>
                <Button onClick={this.apiHandler} disabled={this.state.loadingByEpisodeLengthHeatmap}>
                  {this.state.loadingByEpisodeLengthHeatmap && <i class="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i>}
                  Generate Heatmap
                </Button>
              </Form>
              <Row>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {this.state.byEpisodeLengthList.map((imgObj, index) => (
                    <div key={index}>
                      <Card onClick={() => this.expandImage(`data:image/png;base64,${imgObj.base64}`)}>
                        <CardImg
                          src={`data:image/png;base64,${imgObj.base64}`}
                          style={{ flex: 1, minHeight: '10%', maxHeight: 500, cursor: 'pointer' }}
                        />
                        <CardBody>
                          <CardTitle tag="h4">{imgObj.name}</CardTitle>
                          <CardSubtitle className="text-muted" tag="h5">
                            {imgObj.created_at}
                          </CardSubtitle>
                        </CardBody>
                      </Card>
                    </div>
                  ))}
                </div>
              </Row>
            </TabPane>
            <TabPane tabId="4">
              <Col md={3}>
                <Button onClick={this.apiHandler} disabled={this.state.loadingByLastPositionHeatmap}>
                  {this.state.loadingByLastPositionHeatmap && <i class="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i>}
                  Generate Heatmap
                </Button>
              </Col>
              <Row>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {this.state.byLastPositionList.map((imgObj, index) => (
                    <div key={index}>
                      <Card onClick={() => this.expandImage(`data:image/png;base64,${imgObj.base64}`)}>
                        <CardImg
                          src={`data:image/png;base64,${imgObj.base64}`}
                          style={{ flex: 1, minHeight: '10%', maxHeight: 500, cursor: 'pointer' }}
                        />
                        <CardBody>
                          <CardTitle tag="h4">{imgObj.name}</CardTitle>
                          <CardSubtitle className="text-muted" tag="h5">
                            {imgObj.created_at}
                          </CardSubtitle>
                        </CardBody>
                      </Card>
                    </div>
                  ))}
                </div>
              </Row>
            </TabPane>
          </TabContent>
        )}
        {this.state.isDirectorySelected && (
          <Card className="my-4">
            <CardBody>
              <CardTitle tag="h5">Videos</CardTitle>
              <hr />
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {this.state.videoFilesList.map((videoFileName, index) => (
                  <div>
                    <Card
                      className="m-2"
                      onClick={() => this.openVideo(this.state.videosList[index])}
                      style={{ maxWidth: '160px', width: 'auto', height: 'auto', cursor: 'pointer' }}
                    >
                      <CardImg
                        src={'/assets/play-button.png'}
                        style={{
                          backgroundColor: '#696969',
                          maxWidth: '160px',
                          width: 'auto',
                          height: 'auto',
                          padding: '8px',
                        }}
                      />
                      <CardBody>
                        <CardTitle>{videoFileName}</CardTitle>
                      </CardBody>
                    </Card>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
        <div>
          <Card>
            <CardHeader className="my-1">Frequently Asked Questions</CardHeader>
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header>How do I view videos?</Accordion.Header>
                <Accordion.Body>
                  Select a directory path and any videos generated by RealmAI will appear in the above video card. By
                  clicking on any of the videos, the video will start playing in your default OS video player.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>How can I improve results?</Accordion.Header>
                <Accordion.Body>
                  Ken maybe write a small blurb on using the python gui to tune better/read the ml agents documentation.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="2">
                <Accordion.Header>Documentation</Accordion.Header>
                <Accordion.Body>
                  Visit our <a href="https://realm-ai-project.github.io/documentation">Documentation Site</a>.
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Card>
        </div>
      </div>
    );
  }
}

export default DisplayPage;
