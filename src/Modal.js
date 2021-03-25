import React from "react";
import "./modal.css";

class Modal extends React.Component {
  constructor(props) {
    super();

    this.state = {};
  }

  render() {
    const closeModal = this.props.closeModal;

    return (
      <div className="modal" onClick={event => closeModal(event)}>
      {this.props.children}
     </div>
    );
  }
}

export default Modal;