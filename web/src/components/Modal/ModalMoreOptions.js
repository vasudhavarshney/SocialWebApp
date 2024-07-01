import React, { useState, useContext } from "react";
import { withRouter, Link } from "react-router-dom";
import { MoreHorizSharp } from "@material-ui/icons";

import { MoreOptions, StyledModal } from "./styles";

import { FeedContext } from "../../store/context/FeedContext";
import { FollowContext } from "../../store/context/FollowContext";

const ModalMoreOptions = ({ isAutor, photo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [opacity, setOpacity] = useState(0);

  const { followAction, deleteAction } = useContext(FeedContext);
  const { removeFollow } = useContext(FollowContext);

  function toggleModal(e) {
    setIsOpen(!isOpen);
  }

  function afterOpen() {
    setTimeout(() => {
      setOpacity(1);
    }, 100);
  }

  function beforeClose() {
    return new Promise(resolve => {
      setOpacity(0);
      setTimeout(resolve, 200);
    });
  }

  const handleFollow = idUser => {
    followAction(idUser);
    toggleModal();
    removeFollow(idUser);
  };

  const handleDelete = photo => {
    deleteAction(photo);
    toggleModal();
  };

  return (
    <>
      <MoreHorizSharp
        fontSize="small"
        onClick={toggleModal}
        style={{ cursor: "pointer" }}
      />
      <StyledModal
        isOpen={isOpen}
        afterOpen={afterOpen}
        beforeClose={beforeClose}
        onBackgroundClick={toggleModal}
        onEscapeKeydown={toggleModal}
        opacity={opacity}
        backgroundProps={{ opacity }}
      >
        {isAutor ? (
          <MoreOptions>
            <li>Go to Post
            </li>
            <li className="red" onClick={() => handleDelete(photo)}>
            Delete post
            </li>
            <li onClick={toggleModal}>Cancelar</li>
          </MoreOptions>
        ) : (
          <MoreOptions>
            <li>
              <Link to={`/photo/${photo.id}`}>Go to Post</Link>
            </li>
            <li className="red" onClick={() => handleFollow(photo.user_id)}>
              Unfollow
            </li>
            <li onClick={toggleModal}>Cancel</li>
          </MoreOptions>
        )}
      </StyledModal>
    </>
  );
};
export default withRouter(ModalMoreOptions);
