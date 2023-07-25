import React, { useRef, useState, useEffect } from 'react';

const DraggableButton = ({ thisUser, users, onPositionUpdate }) => {

  const [isDragging, setIsDragging] = useState(false);
  const buttonRef = useRef(null);
  const divRef = useRef(null);
  const initialPosition = useRef({ x: 0, y: 0 });
  const this_user = thisUser;
  const [newPosX, setNewPosX] = useState(this_user.positionX);
  const [newPosY, setNewPosY] = useState(this_user.positionX);
  const all_users = users;

  const handleMoveStart = (event) => {
    if (event.touches) {
      const touch = event.touches[0];
      var { clientX, clientY } = touch;
    }
    else {
      setIsDragging(true);
      var { clientX, clientY } = event;
    }
    const { left, top } = buttonRef.current.getBoundingClientRect();
    initialPosition.current = {
      x: clientX - left,
      y: clientY - top,
    };
    setIsDragging(true);
  };

  const handleMove = (event) => {
    if (event.touches) {
      const touch = event.touches[0];
      var { clientX, clientY } = touch;
    }
    else {
      if (!isDragging) return;
      var { clientX, clientY } = event;
    }

    const { left, top, width, height } = divRef.current.getBoundingClientRect();
    const { width: buttonWidth, height: buttonHeight } = buttonRef.current.getBoundingClientRect();

    const maxX = width - buttonWidth;
    const maxY = height - buttonHeight;

    let newPositionX = clientX - left - initialPosition.current.x;
    let newPositionY = clientY - top - initialPosition.current.y;

    newPositionX = Math.max(0, Math.min(newPositionX, maxX));
    newPositionY = Math.max(0, Math.min(newPositionY, maxY));

    newPositionX = Math.round(newPositionX);
    newPositionY = Math.round(newPositionY);

    setNewPosX(newPositionX);
    setNewPosY(newPositionY);
    buttonRef.current.style.transform = `translate(${newPositionX}px, ${newPositionY}px)`;

  };

  const handleMoveEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleMoveEnd);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleMoveEnd);
    buttonRef.current.style.transform = `translate(${newPosX}px, ${newPosY}px)`;

    if (!isDragging) {
      //console.log('X: '+ newPosX);
      //console.log('Y: '+ newPosY);
      // después de actualizar la posición, llama a la función de callback
      onPositionUpdate(newPosX, newPosY);
    }


    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleMoveEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleMoveEnd);
    };
  }, [isDragging]);


  return (
    <div style={{ margin: '10px' }}>
      <span>
        X: <input type="number" value={newPosX} readOnly />
      </span>
      <br />
      <span>
        Y: <input type="number" value={newPosY} readOnly />
      </span>
      <div
        ref={divRef}
        style={{
          width: '400px',
          height: '400px',
          border: '1px solid black',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'green'
        }}
      >
        <button
          ref={buttonRef}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '35px',
            height: '35px',
            borderRadius: '50%',
            backgroundColor: this_user.color,
            zIndex: '999',
            borderColor: 'white'
          }}
          onMouseDown={handleMoveStart}
          onTouchStart={handleMoveStart}
        ></button>

        {all_users && Object.values(all_users)
          .filter(usuario => usuario.id != this_user.id) // ocultar usuario actual
          .map((usuario) => (
            <div key={usuario.id}
              style={{
                position: 'absolute',
                left: usuario.positionX,
                top: usuario.positionY,
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                backgroundColor: usuario.color,
              }}
            ></div>
          ))
        }

      </div>
    </div>
  );
};

export default DraggableButton;

