import React from "react";
class Modal extends React.Component {
  constructor(props) {
    super();

    this.state = {};
  }

  render() {
    const closeModal = this.props.closeModal;

    return (
      <div className="modal">
          <button aria-label="close" onClick={event => closeModal(event)} />
          {this.props.children}
     </div>
    );
  }
}

export default Modal;