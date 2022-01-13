import React, { Component } from 'react';
import reactFeature from '../../assets/images/react-feature.svg';
import sassFeature from '../../assets/images/sass-feature.svg';
import bootstrapFeature from '../../assets/images/bootstrap-feature.svg';
import responsiveFeature from '../../assets/images/responsive-feature.svg';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';
import { generateHeatmap } from '../../api';

import { Row, Col, Card, CardHeader, CardBody, Progress, Button } from 'reactstrap';
class Dashboard extends Component {
  render() {
    this.state = {
      option: 1,
      dat_id: '5',
    };

    const heroStyles = {
      padding: '50px 0 70px',
    };

    return (
      <div>
        <div className="m-b">
          <h2>Welcome to RealmAI!</h2>
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
              </CardBody>
            </Card>
          </Col>
          <Col md={4} xs={12}>
            <Card>
              <CardHeader>Resources </CardHeader>
              <CardBody>
                <a target="_blank" href="https://www.tensorflow.org/tensorboard" style={{ textDecoration: 'none' }}>
                  <Button color="success" block outline className="mt-2">
                    TensorBoard
                  </Button>{' '}
                </a>
                <a target="_blank" href="https://wandb.ai/site" style={{ textDecoration: 'none' }}>
                  <Button color="primary" block outline className="mt-2">
                    Weights and Biases
                  </Button>{' '}
                </a>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Dashboard;
