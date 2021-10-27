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

class DisplayPage extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      activeTab: '1',
      progress: 40,
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
            <Row>
              <Col>
                <div style={{ textAlign: '-webkit-center' }}>
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
                </div>
              </Col>
            </Row>
          </TabPane>
          <TabPane tabId="2">
            <Row>
              <Col xs="12" md="6">
                <Card color="primary" outline>
                  <CardHeader>Select Parameters</CardHeader>

                  <CardBody>
                    <Row>
                      <ButtonGroup className="m-b" style={{ paddingRight: '5px' }}>
                        <Button onClick={this.down}>Down</Button>
                        <Button onClick={this.up}>Up</Button>
                      </ButtonGroup>
                      <h4> Percentage: {this.state.progress} %</h4>
                    </Row>
                    <Progress className="m-b" value={this.state.progress} />
                    <Button color="success">Generate Heat Map</Button>{' '}
                  </CardBody>
                </Card>
              </Col>
            </Row>
            <Row>
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
            </Row>
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
