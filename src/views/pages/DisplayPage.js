import React, { Component, useState } from 'react';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';
import classnames from 'classnames';
import {
  UncontrolledAlert,
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
  deleteHeatmap,
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
    this.removeImage = this.removeImage.bind(this);
    this.closeImageModal = this.closeImageModal.bind(this);
    this.state = {
      loadingTenserboard: false,
      loadingNaiveHeatmap: false,
      loadingByRewardHeatmap: false,
      loadingByEpisodeLengthHeatmap: false,
      loadingByLastPositionHeatmap: false,
      loadingByEpisodesHeatmap: false,
      directoryError: '',
      activeTab: '1',
      progress: 30,
      params: {
        range_type: 'top',
        percentage: 0.01,
        dat_id: '1',
        file_path: '',
        hm2_start: 0,
        hm2_end: 0,
        hm3_start: 0,
        hm3_end: 0,
        hm5_start: 0,
        hm5_end: 0,
      },
      tempFilePath: '',
      naiveImageList: [],
      byRewardImageList: [],
      modal: false,
      byEpisodeLengthList: [],
      byLastPositionList: [],
      byEpisodesList: [],
      videosList: [],
      videoFilesList: [],
      recentlySelectedDirectories: [],
      isDirectorySelected: false,
      selectedImage: null,
      // added some extra stuff for heatmap 2,3,5
      minDistance: 5,
      hm2StartProgress: 90,
      hm2EndProgress: 100,
      hm3StartProgress: 90,
      hm3EndProgress: 100,
      hm5StartProgress: 90,
      hm5EndProgress: 100,
    };

    this.onClickTenserboardButton = this.onClickTenserboardButton.bind(this);
    this.apiHandler = this.apiHandler.bind(this);
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

  updatePercentage(event) {
    this.setState({ progress: event.target.value });
    // console.log(event.target.value);
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

  // given time in seconds convert it to proper time string
  getTimeString(time) {
    if (time < 60) {
      return `${time.toFixed(2)}s`;
    }
    return `${(time / 60).toFixed(2)}mins`;
  }

  // toast notification functionsq
  toastSuccess = (heatmap_file_name, timestamp, elapsed_time) =>
    toast.success('Succesfully generated ' + heatmap_file_name + ' on ' + timestamp + ' (Took ' + elapsed_time + ')');

  toastHeatmapError = (heatmap_file_name, error) => toast.error('Error generating ' + heatmap_file_name + ': ' + error);

  toastDirectoryError = error => toast.error(error + ', please input a valid directory.');

  toastDeleteSuccess = imgName => toast.success('Successfully deleted ' + imgName);

  async apiHandler() {
    let option = this.state.activeTab;
    let params = this.state.params;
    let start_time = performance.now();
    if (option == '1') {
      this.setState({ loadingNaiveHeatmap: true }, () => {
        generateHeatmap(option, params).then(responseJSON => {
          if (responseJSON.hasOwnProperty('error')) {
            this.toastHeatmapError(responseJSON.name, responseJSON.error);
          } else {
            this.updateHeatmapImageListWithData(responseJSON, this.state.naiveImageList);
            this.toastSuccess(
              responseJSON.name,
              responseJSON.created_at,
              this.getTimeString((performance.now() - start_time) / 1000)
            );
          }
          this.setState({ loadingNaiveHeatmap: false });
        });
      });
    }
    if (option == '2') {
      // this.state.params.percentage = this.state.progress / 100;
      this.state.params.hm2_start = this.state.hm2StartProgress / 100;
      this.state.params.hm2_end = this.state.hm2EndProgress / 100;
      this.setState({ loadingByRewardHeatmap: true }, () => {
        generateHeatmap(option, params).then(responseJSON => {
          if (responseJSON.hasOwnProperty('error')) {
            this.toastHeatmapError(responseJSON.name, responseJSON.error);
          } else {
            this.updateHeatmapImageListWithData(responseJSON, this.state.byRewardImageList);
            this.toastSuccess(
              responseJSON.name,
              responseJSON.created_at,
              this.getTimeString((performance.now() - start_time) / 1000)
            );
          }
          this.setState({ loadingByRewardHeatmap: false });
        });
      });
    }
    if (option == '3') {
      // this.state.params.percentage = this.state.progress / 100;
      this.state.params.hm3_start = this.state.hm3StartProgress / 100;
      this.state.params.hm3_end = this.state.hm3EndProgress / 100;
      this.setState({ loadingByEpisodeLengthHeatmap: true }, () => {
        generateHeatmap(option, params).then(responseJSON => {
          if (responseJSON.hasOwnProperty('error')) {
            this.toastHeatmapError(responseJSON.name, responseJSON.error);
          } else {
            this.updateHeatmapImageListWithData(responseJSON, this.state.byEpisodeLengthList);
            this.toastSuccess(
              responseJSON.name,
              responseJSON.created_at,
              this.getTimeString((performance.now() - start_time) / 1000)
            );
          }
          this.setState({ loadingByEpisodeLengthHeatmap: false });
        });
      });
    }
    if (option == '4') {
      this.setState({ loadingByLastPositionHeatmap: true }, () => {
        generateHeatmap(option, params).then(responseJSON => {
          if (responseJSON.hasOwnProperty('error')) {
            this.toastHeatmapError(responseJSON.name, responseJSON.error);
          } else {
            this.updateHeatmapImageListWithData(responseJSON, this.state.byLastPositionList);
            this.toastSuccess(
              responseJSON.name,
              responseJSON.created_at,
              this.getTimeString((performance.now() - start_time) / 1000)
            );
          }
          this.setState({ loadingByLastPositionHeatmap: false });
        });
      });
    }
    if (option == '5') {
      this.state.params.hm5_start = this.state.hm5StartProgress / 100;
      this.state.params.hm5_end = this.state.hm5EndProgress / 100;
      this.setState({ loadingByEpisodesHeatmap: true }, () => {
        generateHeatmap(option, params).then(responseJSON => {
          if (responseJSON.hasOwnProperty('error')) {
            this.toastHeatmapError(responseJSON.name, responseJSON.error);
          } else {
            this.updateHeatmapImageListWithData(responseJSON, this.state.byEpisodesList);
            this.toastSuccess(
              responseJSON.name,
              responseJSON.created_at,
              this.getTimeString((performance.now() - start_time) / 1000)
            );
          }
          this.setState({ loadingByEpisodesHeatmap: false });
        });
      });
    }
  }

  async onClickTenserboardButton() {
    this.setState({ loadingTenserboard: true }, async () => {
      const responseValidDirectoryJSON = await isValidDirectory(this.state.params.file_path);
      if (responseValidDirectoryJSON.isDirectory == false) {
        // show directory error
        this.toastDirectoryError(responseValidDirectoryJSON.error);
        this.setState({
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

  // Delete image from selected state array
  async removeImage(arrayName, imgObj) {
    this.setState(prevState => {
      return {
        [`${arrayName}`]: prevState[`${arrayName}`].filter(item => {
          return item !== imgObj;
        }),
      };
    });
    // Send request to permanently delete the image
    const res = await deleteHeatmap(this.state.params.file_path, imgObj.name);
    this.toastDeleteSuccess(imgObj.name);
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
      this.state.byEpisodesList = [];
      this.state.videosList = [];
      this.state.videoFilesList = [];

      // check if valid directory, we need to make a backend call since the frontend can't access our file system
      const responseValidDirectoryJSON = await isValidDirectory(this.state.params.file_path);
      if (responseValidDirectoryJSON.isDirectory == false) {
        // show error popup
        this.toastDirectoryError(responseValidDirectoryJSON.error);
        this.setState(prevState => ({
          modal: !prevState.modal,
          isDirectorySelected: false,
        }));
        console.log(this.state.isDirectorySelected);
        return;
      } else {
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
        responseHeatmapsJSON.episode_num.forEach((heatmapObj, index) => {
          oldState.byEpisodesList.push({
            name: heatmapObj.name,
            base64: heatmapObj.base64,
            created_at: heatmapObj.created_at,
          });
        });
        this.setState(oldState);
      }
      if (this.state.tempFilePath != null) {
        this.setState(prevState => ({
          isDirectorySelected: true,
        }));
      }
    } else {
      this.setState({ isDirectorySelected: false });
    }
    this.setState(prevState => ({
      modal: !prevState.modal,
    }));
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

  handleRangeChangeHeatmap2 = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) {
      return;
    }
    let minDistance = this.state.minDistance;
    if (activeThumb === 0) {
      this.setState({ hm2StartProgress: Math.min(newValue[0], this.state.hm2EndProgress - minDistance) });
    } else {
      this.setState({ hm2EndProgress: Math.max(newValue[1], this.state.hm2StartProgress + minDistance) });
    }
  };

  handleRangeChangeHeatmap3 = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) {
      return;
    }
    let minDistance = this.state.minDistance;
    if (activeThumb === 0) {
      this.setState({ hm3StartProgress: Math.min(newValue[0], this.state.hm3EndProgress - minDistance) });
    } else {
      this.setState({ hm3EndProgress: Math.max(newValue[1], this.state.hm3StartProgress + minDistance) });
    }
  };

  handleRangeChangeHeatmap5 = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) {
      return;
    }
    let minDistance = this.state.minDistance;
    if (activeThumb === 0) {
      this.setState({ hm5StartProgress: Math.min(newValue[0], this.state.hm5EndProgress - minDistance) });
    } else {
      this.setState({ hm5EndProgress: Math.max(newValue[1], this.state.hm5StartProgress + minDistance) });
    }
  };

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
              {this.state.loadingTenserboard && <i class="fa fa-circle-o-notch fa-spin fa-lg fa-fw" />}
              TensorBoard
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
                        style={{ width: 'auto' }}
                        onClick={() => this.fillInPathWithSelectedRecentDirectory(directory)}
                        style={{ width: '400px', overflow: 'hidden', wordWrap: 'break-word' }}
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
            <NavItem>
              <NavLink
                href="#"
                className={classnames({ active: this.state.activeTab === '5' })}
                onClick={() => {
                  this.toggleTab('5');
                }}
              >
                Heatmaps by Episodes
              </NavLink>
            </NavItem>
          </Nav>
        )}
        {this.state.isDirectorySelected && (
          <TabContent activeTab={this.state.activeTab}>
            <TabPane tabId="1">
              <Col md={3}>
                <Button onClick={this.apiHandler} disabled={this.state.loadingNaiveHeatmap}>
                  {this.state.loadingNaiveHeatmap && <i class="fa fa-circle-o-notch fa-spin fa-lg fa-fw" />}
                  Generate Heatmap
                </Button>
              </Col>
              <Row>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {this.state.naiveImageList.map((imgObj, index) => (
                    <div key={index}>
                      <Card>
                        <CardImg
                          src={`data:image/png;base64,${imgObj.base64}`}
                          style={{
                            minHeight: '10%',
                            maxHeight: 500,
                            cursor: 'pointer',
                          }}
                          onClick={() => this.expandImage(`data:image/png;base64,${imgObj.base64}`)}
                        />
                        <CardBody>
                          <CardTitle tag="h4">{imgObj.name}</CardTitle>
                          <CardSubtitle className="text-muted" tag="h5">
                            {imgObj.created_at}
                          </CardSubtitle>
                          <Button
                            className="my-2"
                            color="danger"
                            onClick={() => this.removeImage('naiveImageList', imgObj)}
                          >
                            DELETE
                          </Button>
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
                {/* <Row form>
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
                </Row> */}
                <Row form>
                  <Col md={3}>
                    <FormGroup>
                      <Label className="mb-2">Percentage Range</Label>
                      <CardBody className="mb-2">
                        {/* <Row>
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
                        </Row> */}
                        <Row>
                          <Slider
                            value={[this.state.hm2StartProgress, this.state.hm2EndProgress]}
                            onChange={this.handleRangeChangeHeatmap2}
                            step={5}
                            marks
                            valueLabelDisplay="on"
                            className="mt-2"
                          />
                        </Row>
                      </CardBody>
                    </FormGroup>
                  </Col>
                </Row>
                <Button onClick={this.apiHandler} disabled={this.state.loadingByRewardHeatmap}>
                  {this.state.loadingByRewardHeatmap && <i class="fa fa-circle-o-notch fa-spin fa-lg fa-fw" />}
                  Generate Heatmap
                </Button>
              </Form>
              <Row>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {this.state.byRewardImageList.map((imgObj, index) => (
                    <div key={index}>
                      <Card>
                        <CardImg
                          src={`data:image/png;base64,${imgObj.base64}`}
                          style={{ flex: 1, minHeight: '10%', maxHeight: 500, cursor: 'pointer' }}
                          onClick={() => this.expandImage(`data:image/png;base64,${imgObj.base64}`)}
                        />
                        <CardBody>
                          <CardTitle tag="h4">{imgObj.name}</CardTitle>
                          <CardSubtitle className="text-muted" tag="h5">
                            {imgObj.created_at}
                          </CardSubtitle>
                          <Button
                            className="my-2"
                            color="danger"
                            onClick={() => this.removeImage('byRewardImageList', imgObj)}
                          >
                            DELETE
                          </Button>
                        </CardBody>
                      </Card>
                    </div>
                  ))}
                </div>
              </Row>
            </TabPane>
            <TabPane tabId="3">
              <Form>
                {/* <Row form>
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
                </Row> */}
                <Row form>
                  <Col md={3}>
                    <FormGroup>
                      <Label className="mb-2">Percentage Range</Label>
                      <CardBody className="mb-2">
                        {/* <Row>
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
                        </Row> */}
                        <Row>
                          <Slider
                            value={[this.state.hm3StartProgress, this.state.hm3EndProgress]}
                            onChange={this.handleRangeChangeHeatmap3}
                            step={5}
                            marks
                            valueLabelDisplay="on"
                            className="mt-2"
                          />
                        </Row>
                      </CardBody>
                    </FormGroup>
                  </Col>
                </Row>
                <Button onClick={this.apiHandler} disabled={this.state.loadingByEpisodeLengthHeatmap}>
                  {this.state.loadingByEpisodeLengthHeatmap && <i class="fa fa-circle-o-notch fa-spin fa-lg fa-fw" />}
                  Generate Heatmap
                </Button>
              </Form>
              <Row>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {this.state.byEpisodeLengthList.map((imgObj, index) => (
                    <div key={index}>
                      <Card>
                        <CardImg
                          src={`data:image/png;base64,${imgObj.base64}`}
                          style={{ flex: 1, minHeight: '10%', maxHeight: 500, cursor: 'pointer' }}
                          onClick={() => this.expandImage(`data:image/png;base64,${imgObj.base64}`)}
                        />
                        <CardBody>
                          <CardTitle tag="h4">{imgObj.name}</CardTitle>
                          <CardSubtitle className="text-muted" tag="h5">
                            {imgObj.created_at}
                          </CardSubtitle>
                          <Button
                            className="my-2"
                            color="danger"
                            onClick={() => this.removeImage('byEpisodeLengthList', imgObj)}
                          >
                            DELETE
                          </Button>
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
                  {this.state.loadingByLastPositionHeatmap && <i class="fa fa-circle-o-notch fa-spin fa-lg fa-fw" />}
                  Generate Heatmap
                </Button>
              </Col>
              <Row>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {this.state.byLastPositionList.map((imgObj, index) => (
                    <div key={index}>
                      <Card>
                        <CardImg
                          src={`data:image/png;base64,${imgObj.base64}`}
                          style={{ flex: 1, minHeight: '10%', maxHeight: 500, cursor: 'pointer' }}
                          onClick={() => this.expandImage(`data:image/png;base64,${imgObj.base64}`)}
                        />
                        <CardBody>
                          <CardTitle tag="h4">{imgObj.name}</CardTitle>
                          <CardSubtitle className="text-muted" tag="h5">
                            {imgObj.created_at}
                          </CardSubtitle>
                          <Button
                            className="my-2"
                            color="danger"
                            onClick={() => this.removeImage('byLastPositionList', imgObj)}
                          >
                            DELETE
                          </Button>
                        </CardBody>
                      </Card>
                    </div>
                  ))}
                </div>
              </Row>
            </TabPane>
            <TabPane tabId="5">
              <Form>
                <Row form>
                  <Col md={3}>
                    <FormGroup>
                      <Label className="mb-2">Relative Episode Range</Label>
                      <CardBody className="mb-2">
                        <Row>
                          <Slider
                            value={[this.state.hm5StartProgress, this.state.hm5EndProgress]}
                            onChange={this.handleRangeChangeHeatmap5}
                            step={5}
                            marks
                            valueLabelDisplay="on"
                            className="mt-2"
                          />
                        </Row>
                      </CardBody>
                    </FormGroup>
                  </Col>
                </Row>
                <Button onClick={this.apiHandler} disabled={this.state.loadingByEpisodesHeatmap}>
                  {this.state.loadingByEpisodesHeatmap && <i class="fa fa-circle-o-notch fa-spin fa-lg fa-fw" />}
                  Generate Heatmap
                </Button>
              </Form>
              <Row>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {this.state.byEpisodesList.map((imgObj, index) => (
                    <div key={index}>
                      <Card>
                        <CardImg
                          src={`data:image/png;base64,${imgObj.base64}`}
                          style={{ flex: 1, minHeight: '10%', maxHeight: 500, cursor: 'pointer' }}
                          onClick={() => this.expandImage(`data:image/png;base64,${imgObj.base64}`)}
                        />
                        <CardBody>
                          <CardTitle tag="h4">{imgObj.name}</CardTitle>
                          <CardSubtitle className="text-muted" tag="h5">
                            {imgObj.created_at}
                          </CardSubtitle>
                          <Button
                            className="my-2"
                            color="danger"
                            onClick={() => this.removeImage('byEpisodesList', imgObj)}
                          >
                            DELETE
                          </Button>
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
            <CardHeader className="my-1">Links / FAQ</CardHeader>
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header>How do I view videos?</Accordion.Header>
                <Accordion.Body>
                  Select a directory path and any videos generated by RealmAI will appear in the above video card. By
                  clicking on any of the videos, the video will start playing in your default OS video player.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>How do I update my heatmaps?</Accordion.Header>
                <Accordion.Body>
                  If a heatmap is regenerated using the same parameters as existing heatmap(s), the newer heatmap will
                  replace the older ones.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="2">
                <Accordion.Header>What is considered a "valid directory"?</Accordion.Header>
                <Accordion.Body>
                  To properly generate heatmaps, users are expected to integrate their game with the REALM-AI Unity
                  plugin. During training, the plugin creates a custom directory structure containing the necessary data
                  for heatmap generation and video replay retrieval. Therefore, we validate a directory by checking if
                  the "RealmAI" folder exists within, and if the "Data" and "Videos" folders exist within the "RealmAI"
                  folder.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="3">
                <Accordion.Header>Weights and Biases</Accordion.Header>
                <Accordion.Body>
                  Since Weights and Biases is an optional component of the RL training manager, users who are using it
                  can directly visit <a href="https://wandb.ai/site">Weights and Biases' website</a> to view the
                  training dashboards.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="4">
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
