import React, { Component } from "react";
import {
  RateLabel,
  BorderText,
  PageStyle,
  MainDiv,
  TableStyle,
  TableBodyStyle,
  ActionButtonsStyle,
} from "./styles";

// Pop-up -> detalhes
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

import ReactLoading from "react-loading";

import { connect } from "react-redux";
import { Creators as HistoryCreator } from "../../store/ducks/history";
import { Table, Button, Form, Alert } from "react-bootstrap";
import ReactStars from "react-rating-stars-component";

class History extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orderToRate: -1,
      data: [],
      showSuccess: false,
      showFailed: false,
    };
  }

  componentDidMount() {
    this.props.getHistory();
    this.setState({ data: this.props.history.data });
  }

  render() {
    const { orderToRate } = this.state;
    const { history } = this.props;
    return (
      <PageStyle>
        {this.state.showSuccess ? (
          <Alert
            variant="success"
            onClose={() =>
              this.setState({
                showFailed: false,
                showSuccess: false,
              })
            }
            dismissible
          >
            <Alert.Heading>Avaliação enviada com sucesso.</Alert.Heading>
            <p>Obrigado por avaliar.</p>
          </Alert>
        ) : null}
        {this.state.showFailed ? (
          <Alert
            variant="danger"
            onClose={() =>
              this.setState({
                showFailed: false,
                showSuccess: false,
              })
            }
            dismissible
          >
            <Alert.Heading>Erro ao enviar a atualização {" :("}</Alert.Heading>
            <p>Tente novamente mais tarde.</p>
          </Alert>
        ) : null}
        <BorderText className="m-3">
          <h1>Histórico de pedidos</h1>
        </BorderText>
        {history.loading ? (
          <ReactLoading
            type={"spin"}
            style={{
              position: "absolute",
              width: "10vw",
              top: "40%",
              left: "0",
              right: "0",
              margin: "auto",
            }}
          />
        ) : (
          <MainDiv>
            <TableStyle>
              <Table borderless variant="info">
                <tbody>
                  {this.state.data.map((element) => (
                    <tr key={element.id}>
                      <td className="p-2">
                        <TableBodyStyle>
                          <p>Pedido {element.id + 1}</p>
                          <p>Preço total: {element.total_price}</p>
                        </TableBodyStyle>
                      </td>
                      <td>
                        {!element.rate.did ? (
                          <Button
                            variant="primary"
                            disabled={orderToRate >= 0 ? true : false}
                            onClick={() =>
                              this.setState({
                                orderToRate: element.id,
                              })
                            }
                            className="mx-3"
                          >
                            Avaliar Pedido
                          </Button>
                        ) : (
                          <Button
                            variant="danger"
                            disabled={orderToRate >= 0 ? true : false}
                            onClick={() =>
                              this.setState({
                                orderToRate: element.id,
                              })
                            }
                            className="mx-3"
                          >
                            Revisar avaliação
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableStyle>
            {orderToRate > -1 ? (
              <Form className="m-3">
                <Form.Group controlId="userFeedback">
                  <Form.Label
                    className="m-3"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexDirection: "column",
                    }}
                  >
                    <RateLabel>
                      <h2>Pedido {this.state.data[orderToRate].id + 1}</h2>
                      <Popup
                        trigger={<Button variant="warning">Detalhes</Button>}
                        position="right center"
                      >
                        <div>{this.state.data[orderToRate].description}</div>
                      </Popup>
                    </RateLabel>
                    <ReactStars
                      count={5}
                      onChange={(newRating) => {
                        const historyData = [...this.state.data];
                        historyData[orderToRate] = {
                          ...historyData[orderToRate],
                          rate: {
                            ...historyData[orderToRate].rate,
                            stars: newRating,
                          },
                        };

                        this.setState({
                          data: historyData,
                        });
                      }}
                      isHalf={true}
                      value={this.state.data[orderToRate].rate.stars}
                      edit={!this.state.data[orderToRate].rate.did}
                      size={50}
                      activeColor="#ffd700"
                    />
                  </Form.Label>
                  <Form.Control
                    disabled={this.state.data[orderToRate].rate.did}
                    as="textarea"
                    type="text"
                    className="mr-2"
                    defaultValue={
                      this.state.data[orderToRate].rate.feedback_text
                        ? this.state.data[orderToRate].rate.feedback_text
                        : ""
                    }
                    rows={12}
                    placeholder={
                      !this.state.data[orderToRate].rate.did
                        ? "Deixe seu feeback!"
                        : ""
                    }
                    onChange={(text) => {
                      const historyData = [...this.state.data];
                      historyData[orderToRate] = {
                        ...historyData[orderToRate],
                        rate: {
                          ...historyData[orderToRate].rate,
                          feedback_text: text.target.value,
                        },
                      };

                      this.setState({ data: historyData });
                    }}
                    style={{ fontWeight: "600" }}
                  />
                  <Form.Text className="text-muted">
                    Sua avaliação nos ajuda a melhorar a experiência do app :
                    {")"}
                  </Form.Text>
                </Form.Group>
                {!this.state.data[orderToRate].rate.did ? (
                  <ActionButtonsStyle className="mt-2">
                    <Button
                      variant="secondary"
                      onClick={() => this.setState({ orderToRate: -1 })}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="danger"
                      onClick={(element) => {
                        const historyData = [...this.state.data];
                        historyData[orderToRate] = {
                          ...historyData[orderToRate],
                          rate: {
                            ...historyData[orderToRate].rate,
                            did: true,
                          },
                        };

                        try {
                          this.setState({ data: historyData }, () => {
                            this.props.postHistory(this.state.data);
                            this.setState({ showSuccess: true });
                          });
                        } catch (err) {
                          this.setState({ showFailed: true });
                        }
                      }}
                    >
                      Enviar
                    </Button>
                  </ActionButtonsStyle>
                ) : (
                  <Button
                    variant="outline-primary"
                    onClick={() => this.setState({ orderToRate: -1 })}
                    className="mt-2"
                  >
                    Voltar
                  </Button>
                )}
              </Form>
            ) : null}
          </MainDiv>
        )}
      </PageStyle>
    );
  }
}

const mapStateToProps = ({ history }) => ({ history });

export default connect(mapStateToProps, { ...HistoryCreator })(History);
