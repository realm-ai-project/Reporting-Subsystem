import React, { Component } from 'react';
import reactFeature from '../../assets/images/react-feature.svg';
import sassFeature from '../../assets/images/sass-feature.svg';
import bootstrapFeature from '../../assets/images/bootstrap-feature.svg';
import responsiveFeature from '../../assets/images/responsive-feature.svg';
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Progress,
  Button
} from 'reactstrap';
class Dashboard extends Component {
  render() {
    const heroStyles = {
      padding: '50px 0 70px'
    };

    return (
      <div>
        <div className="m-b">
          <h2>Welcome to REALM_AI!</h2>
          <p className="text-muted">
            Fun Fact: Did you know Douglas Wilhelm Harder published a report in 2010 called: Writing using Word
          </p>
        </div>
        <Row>
          <Col md={4} xs={12}>
            <Card>
              <CardHeader>
                Total Episodes Recorded{' '}
                <Button size="sm" className="pull-right">
                  View
                </Button>
              </CardHeader>
              <CardBody>
                <h2 className="m-b-20 inline-block">
                  <span>12,345</span>
                </h2>
                {/* {' '}
                <i
                  className="fa fa-caret-down text-danger"
                  aria-hidden="true"
                />
                <Progress value={77} color="warning" /> */}
              </CardBody>
            </Card>
          </Col>
          <Col md={4} xs={12}>
            <Card>
              <CardHeader>
                Last Run Time{' '}
                <Button size="sm" className="pull-right">
                  View
                </Button>
              </CardHeader>
              <CardBody>
                <h3>
                  <span>09/20/2021 07:41 PM</span>
                </h3>
                {/* {' '}
                <i className="fa fa-caret-up text-danger" aria-hidden="true" />
                <Progress value={77} color="success" /> */}
              </CardBody>
            </Card>
          </Col>
          <Col md={4} xs={12}>
            <Card>
              <CardHeader>
                Server Capacity{' '}
                <Button size="sm" className="pull-right">
                  View
                </Button>
              </CardHeader>
              <CardBody>
                <h2 className="inline-block">
                  <span>14%</span>
                </h2>
                <Progress value={14} color="primary" />
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* <Row>
          <Col md={6}>
            <Card>
              <CardBody className="display-flex">
                <img
                  src={reactFeature}
                  style={{ width: 70, height: 70 }}
                  alt="react.js"
                  aria-hidden={true}
                />
                <div className="m-l">
                  <h2 className="h4">React.js</h2>
                  <p className="text-muted">
                    Built to quickly get your MVPs off the ground.
                  </p>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <CardBody className="display-flex">
                <img
                  src={bootstrapFeature}
                  style={{ width: 70, height: 70 }}
                  alt="Bootstrap"
                  aria-hidden={true}
                />
                <div className="m-l">
                  <h2 className="h4">Bootstrap 4</h2>
                  <p className="text-muted">
                    The most popular framework to get your layouts built.
                  </p>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Card>
              <CardBody className="display-flex">
                <img
                  src={sassFeature}
                  style={{ width: 70, height: 70 }}
                  alt="Sass"
                  aria-hidden={true}
                />
                <div className="m-l">
                  <h2 className="h4">Sass</h2>
                  <p className="text-muted">
                    Easily change the design system styles to fit your needs.
                  </p>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <CardBody className="display-flex">
                <img
                  src={responsiveFeature}
                  style={{ width: 70, height: 70 }}
                  alt="Responsive"
                  aria-hidden={true}
                />
                <div className="m-l">
                  <h2 className="h4">Responsive</h2>
                  <p className="text-muted">
                    Designed for screens of all sizes.
                  </p>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row> */}
      </div>
    );
  }
}

export default Dashboard;
