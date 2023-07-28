'use client'
require('dotenv').config();
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MovePlayers from './MovePlayers';

import { coloresCSS } from '@/app/utils/colors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPeopleGroup } from '@fortawesome/free-solid-svg-icons'
import { faAngleRight } from '@fortawesome/free-solid-svg-icons'
import { faShuffle } from '@fortawesome/free-solid-svg-icons'
import { faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { faHandPointer } from '@fortawesome/free-solid-svg-icons'
import { faMessage } from '@fortawesome/free-solid-svg-icons'
import { faCopy } from '@fortawesome/free-solid-svg-icons'

import firebaseConfig from "@/app/utils/Firebase/firebaseConfig";
import { uid } from 'uid';
import Cookies from 'js-cookie';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, get, update, goOffline, off } from "firebase/database";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

let user_data;
let UserId;

function getCookies(id_partido) {
  const id = id_partido;
  const cookies = document.cookie.split(';').map(cookie => cookie.trim());
  for (let i = 0; i < cookies.length; i++) {
    if (cookies[i].includes(id)) {
      const [name, value] = cookies[i].split('=');
      return { name, value };
    }
  }
  return null;
}



function PartidoComponent(props) {

  const router = useRouter();
  // obtener :id desde la url
  const { id } = props;
  const dbRef = ref(database, `partido/${id}`);
  const [data, setData] = useState("");
  const [hasUserCookies, setHasUserCookies] = useState(null);
  const [formData, setFormData] = useState({});
  const messagesRef = useRef(null);
  // Configuración de la solicitud con la clave secreta


  useEffect(() => {

    const cookie = getCookies(id);
    // obtener datos del usuario a partir de la cookie
    function get_user() {
      // verificar si existe el partido con esa ID en la cookie
      get(dbRef).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();

          // por cada usuario en la data, chekear si coincide la cookie.value con el id del usuario
          for (const userId in data.usuarios) {
            const user = data.usuarios[userId];
            // buscar si el id de usuario en la db coincide con el valor de la cookie
            if (cookie && user.id === cookie.value) {
              user_data = user;
              UserId = user.id;
              //console.log('El usuario posee cookies guardadas con username: ' + user.username);
              setHasUserCookies(true);
              break;
            }
            else {
              setHasUserCookies(false);
              //console.log('No existe el usuario en las cookies');
            }
          }
        }
        else {
          //console.log('No existe el partido, ID incorrecta');
          router.push('/');
        }

      }).catch((error) => {
        //console.log('Error al obtener los datos del partido: ', error);
      });
    }

    get_user();

    onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        setData(snapshot.val());
      }
      else {
        //console.log("No existe el partido");
        router.push('/');
      }
    });

  }, [id]);

  useEffect(() => {
    // Referencia a la ubicación en la base de datos donde se encuentra el registro a modificar
    // Realizar el update con los nuevos valores del formulario
    update(dbRef, formData);
  }, [formData]);




  const unirsePartido = (event) => {
    event.preventDefault();

    get(dbRef).then((snapshot) => {
      if (snapshot.exists()) {
        const users_get = snapshot.val().usuarios;
        const partido_url = snapshot.val().url;
        const numUsuarios = Object.keys(users_get).length;
        const timestamp = new Date().getTime();
        if (numUsuarios < 30) {
          const user_id = uid(8);
          update(ref(database, `partido/${id}/usuarios`), {
            [user_id]: {
              "id": user_id,
              "username": event.target[0].value,
              "color": coloresCSS[numUsuarios - 1],
              "order": timestamp,
              "equipo": 0,
              "positionX": 0,
              "positionY": 0
            }
          }).then(() => {
            //console.log('Los datos se han actualizado correctamente');
            // crear cookie con id del  partido y usuario
            Cookies.set(id, user_id, { expires: 30 });
            // redirigir al PartidoComponent
            window.location.reload();
          });
        }
        else {
          alert('El partido está lleno');
        }
      }
    }).catch((error) => {
      //console.error('Error al obtener los datos del partido: ', error);
    });

  }

  const [copiado, setCopiado] = useState(false);
  // copiar link al portapapeles
  const copiarLink = (event) => {
    event.preventDefault();
    navigator.clipboard.writeText(event.target.id);
    setCopiado(true);

    setTimeout(() => {
      setCopiado(false);
    }, 3000);
  };

  const cambiarEquipo = (event) => {
    event.preventDefault();
    const value = Number(event.target.id);
    const user_id = event.target.name;

    update(ref(database, `partido/${id}/usuarios/${user_id}`), {
      "equipo": value,
    },).then(() => {
      //console.log('Los datos se han actualizado correctamente');
    }).catch((error) => {
      //console.error('Error al escribir los datos: ', error);
    });
  }

  const darAdmin = (event) => {
    event.preventDefault();
    const value = true;
    const user_id = event.target.name;

    update(ref(database, `partido/${id}/usuarios/${user_id}`), {
      "is_admin": value,
    },).then(() => {
      //console.log('Los datos se han actualizado correctamente');
    }).catch((error) => {
      //console.error('Error al escribir los datos: ', error);
    });
  }

  const mensajeChat = (event) => {
    event.preventDefault();
    const msg_id = uid(6);
    const input_txt = event.target[0].value;
    const timestamp = new Date().getTime();
    // Accede al elemento de entrada de texto y restablece su valor a una cadena vacía
    event.target[0].value = '';
    update(ref(database, `partido/${id}/chat`), {
      [msg_id]: {
        "message_id": msg_id,
        "user_id": user_data.id,
        "sender_username": user_data.username,
        "color": user_data.color,
        "text": input_txt,
        "timestamp": timestamp
      }
    }).then(() => {
      //console.log('Los datos se han actualizado correctamente');
      const partidoRef = ref(database, `partido/${id}`);
      get(partidoRef).then((snapshot) => {
        const partido = snapshot.val();
        //console.log('Partido actualizado correctamente: ', partido);
      }).catch((error) => {
        //console.error('Error al obtener los datos del partido: ', error);
      });

      // Actualiza la propiedad scrollTop para mantener el scroll abajo cada vez que se actualiza la lista de mensajes
      if (messagesRef.current) {
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }

    }).catch((error) => {
      //console.error('Error al escribir los datos: ', error);
    });
  }

  // Desconecta Firebase cuando el componente se desmonte (la aplicación se cierra)
  useEffect(() => {
    return () => {
      off(database);
      goOffline(database);
    };
  }, []);


  // esta funcion conecta con componente hijo
  const handlePositionUpdate = (newX, newY) => {
    //console.log('Button position updated:', newX, newY);
    update(ref(database, `partido/${id}/usuarios/${user_data.id}`), {
      "positionX": newX,
      "positionY": newY,
    },).then(() => {
      //console.log('Los datos se han actualizado correctamente');
    }).catch((error) => {
      //console.error('Error al escribir los datos: ', error);
    });
  };


const [isLoading, setIsLoading] = useState(false);
const [errorMessage, setErrorMessage] = useState('');

// input ID onChange
const [idLength, setIdLength] = useState(0);
const alphanumericPattern = /^[a-zA-Z0-9]+$/;

const handleChangeEvent = (event) => {
  setIdLength(event.target.value.length);
  if (event.target.value.length > 0) {
      if (alphanumericPattern.test(event.target.value)) {
          setErrorMessage("");
      }
      else {
          setErrorMessage("Hay caracteres que no están permitidos 🙃");
      }
  }
}


  // si existe data con el id de la url
  if (data !== null && data !== "") {

    if (hasUserCookies === true) {
      const numUsuarios = Object.keys(data.usuarios).length;
      return (
        <div>

          <div className='sub-container mt-5 text-white pt-2 pb-3 ps-4 fs-4 lh-lg text-center justify-content-center align-items-center'
            style={{ borderRadius: "20px 20px 0px 0px" }}>
            {
              //<h1 className='p-2 m-0'>⚽ PeloTurno</h1>
            }
            <span>
              <b>ID:</b> &nbsp;
              <span className='text-light text-decoration-underline'>{data.id}</span> &nbsp;
              <button id={data.id} onClick={copiarLink} className='btn btn-warning fs-6 btn-sm'>
                {!copiado ? (
                  <span>
                    <FontAwesomeIcon style={{ position: 'relative', right: '2px', pointerEvents: 'none', width: '18px' }} icon={faCopy} /> Copiar
                  </span>
                  ):
                  <span>
                    <FontAwesomeIcon style={{ position: 'relative', right: '2px', pointerEvents: 'none', width: '18px' }} icon={faCheck} /> Copiar
                  </span>                
                  }
              </button>
            </span>

          </div>

          <div className='sub-container text-white pb-3 pt-3 ps-4 fs-4 lh-lg'>


            <form>
              <div className="row align-items-center mt-2">
                <label className="col-4 fw-bold form-labels" htmlFor="fecha">Fecha:</label>
                <div className="col-7">
                  <input type="date" value={data.fecha} id="fecha"
                    className="form-control fs-5 p-1" autoComplete='off' required
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })} />
                </div>
              </div>
              <div className="row align-items-center mt-2">
                <label className="col-4 fw-bold form-labels" htmlFor='hora'>Hora:</label>
                <div className="col-7">
                  <input type="time" value={data.hora} id="hora" className="form-control fs-5 p-1" autoComplete="off" required
                    onChange={(e) => setFormData({ ...formData, hora: e.target.value })} />
                </div>
              </div>
              <div className="row align-items-center mt-2">
                <label className="col-4 fw-bold form-labels" htmlFor='lugar'>Lugar:</label>
                <div className="col-7">
                  <input type="text" value={data.lugar} id='lugar' placeholder='Escribir aqui' className="form-control fs-5 p-1" autoComplete="off" required
                    onChange={(e) => setFormData({ ...formData, lugar: e.target.value })} maxLength={32} />
                </div>
              </div>
              <div className="row align-items-center mt-2">
                <label className="col-4 fw-bold form-labels" htmlFor="precio" >Precio:</label>
                <div className="col-7">
                  <input type="number" value={data.precio} id='precio' placeholder='$' className="form-control fs-5 p-1" autoComplete="off" required
                    onChange={(e) => setFormData({ ...formData, precio: Number(e.target.value) })} />
                </div>
              </div>
              <div className="row align-items-center mt-2 mb-2">
                <label className="col-4 fw-bold form-labels" htmlFor='alquilado' >Alquilado:</label>
                <div className="col-6 d-flex">
                  <input type="checkbox" className="form-check-input fs-5 m-0" style={{ cursor: 'pointer' }} checked={data.alquilado} id="alquilado" autoComplete="off" required
                    onChange={(e) => setFormData({ ...formData, alquilado: e.target.checked })} />
                </div>
              </div>
            </form>

          </div>


          <div className='sub-container py-2 px-4 fs-4 lh-lg bg-white'>
            <div className='text-center py-1  justify-content-center align-items-center fw-bold'>Jugadores: ({numUsuarios}) </div>
            <div>
              {data.usuarios && Object.values(data.usuarios)
                .filter(usuario => usuario.equipo === 0) // filtrar por equipo 1
                .sort((a, b) => a.order - b.order) // ordenar por timestamp
                .map((usuario) => (
                  <div className='row me-0' key={usuario.id}>

                    <div className='col-7 pb-1' key={usuario.id} style={{ color: usuario.color }}>
                      <b>{usuario.username}</b> <span role="img" aria-label='pelota'>- {usuario.is_admin ? '⚽' : ''} </span>
                    </div>

                    {data.usuarios[UserId].is_admin ?
                      <div className='col-5 text-end pe-0'>
                        <button name={usuario.id} title='Equipo 1' id='1' onClick={cambiarEquipo} className='btn btn-light border border-dark border-2 fs-5 px-2 py-0'>1</button>
                        &nbsp;&nbsp;
                        <button name={usuario.id} title='Equipo 2' id='2' onClick={cambiarEquipo} className='btn btn-light border border-dark border-2 fs-5 px-2 py-0'>2</button>
                        &nbsp;&nbsp;
                        <button name={usuario.id} title='Dar admin' id='2' onClick={darAdmin} className='btn btn-outline-info border border-dark border-2 fs-6 px-1 py-1'>⚽</button>
                      </div> :
                      null
                    }

                  </div>
                ))
              }
            </div>
          </div>

          <div className='sub-container pt-3 pb-3 px-4 fs-4 lh-lg bg-white'>
            <div className='fw-bold'>Equipo 1:</div>
            <ol>
              {data.usuarios && Object.values(data.usuarios)
                .filter(usuario => usuario.equipo === 1) // filtrar por equipo 1
                .sort((a, b) => a.order - b.order) // ordenar por timestamp
                .map((usuario) => (
                  <div className='row me-0' key={usuario.id}>
                    <div className='col-7 pb-1' key={usuario.id}>
                      <li key={usuario.id} style={{ color: usuario.color }}><b>{usuario.username}</b> <span role="img" aria-label='pelota'>{usuario.is_admin ? '⚽' : ''} </span> </li>
                    </div>

                    {data.usuarios[UserId].is_admin ?
                      <div className='col-5 text-end pe-0'>
                        <button name={usuario.id} title='Equipo 2' id='2' onClick={cambiarEquipo} className='btn btn-light border border-dark border-2 fs-5 px-1 py-0'><FontAwesomeIcon className="ms-1" style={{ position: 'relative', right: '2px', pointerEvents: 'none' }} icon={faChevronDown} /> </button>
                        &nbsp;&nbsp;
                        <button name={usuario.id} title='Dar admin' id='2' onClick={darAdmin} className='btn btn-outline-info border border-dark border-2 fs-6 px-1 py-1'>⚽</button>
                      </div> :
                      null
                    }
                  </div>

                ))
              }
            </ol>
          </div>

          <div className='sub-container pt-3 pb-3 px-4 fs-4 lh-lg bg-white'>
            <div className='fw-bold'>Equipo 2:</div>
            <ol >
              {data.usuarios && Object.values(data.usuarios)
                .filter(usuario => usuario.equipo === 2) // filtrar por equipo 1
                .sort((a, b) => a.order - b.order) // ordenar por timestamp
                .map((usuario) => (
                  <div className='row me-0' key={usuario.id}>
                    <div className='col-7 pb-1' key={usuario.id}>
                      <li key={usuario.id} style={{ color: usuario.color }}><b>{usuario.username}</b> <span role="img" aria-label='pelota'> {usuario.is_admin ? '⚽' : ''} </span></li>
                    </div>

                    {data.usuarios[UserId].is_admin ?
                      <div className='col-5 text-end pe-0'>
                        <button name={usuario.id} title='Equipo 1' id='1' onClick={cambiarEquipo} className='btn btn-light border border-dark border-2 fs-5 px-1 py-0'><FontAwesomeIcon className="ms-1" style={{ position: 'relative', right: '2px', pointerEvents: 'none' }} icon={faChevronUp} /></button>
                        &nbsp;&nbsp;
                        <button name={usuario.id} title='Dar admin' id='2' onClick={darAdmin} className='btn btn-outline-info border border-dark border-2 fs-6 px-1 py-1'>⚽</button>
                      </div> :
                      null
                    }
                  </div>
                ))
              }
            </ol>
          </div>

          <div className='sub-container shadow pt-3 pb-3 ps-4 fs-4 lh-lg'
            style={{ borderRadius: "0px 0px 20px 20px", backgroundColor: "rgb(240, 240, 240)" }}>
            <div className='text-center justify-content-center align-items-center'>
              <button className='btn btn-secondary btn-lg'>Mezclar <FontAwesomeIcon className="ms-1" style={{ position: 'relative', top: '1px' }} icon={faShuffle} /></button>
            </div>
          </div>


          <div className='container bg-transparent shadow text-center mt-5 mb-5 pb-5 pt-3 fs-4 lh-lg' style={{ borderRadius: "20px 20px 20px 20px" }}>
            <p className='text-white lh-base fw-bold pb-0 mb-0'>Campo de Juego</p>
            <p className='text-white lh-base fs-5 mb-4'>Arrastra tu jugador a una posición <FontAwesomeIcon className="ms-1" style={{ position: 'relative' }} icon={faHandPointer} /></p>
            <MovePlayers
              thisUser={user_data}
              users={data.usuarios}
              onPositionUpdate={handlePositionUpdate}
            />
          </div>

          <div className='sub-container shadow mt-5 mb-5 pb-4 pt-3 px-4 fs-4 lh-lg'
            style={{ borderRadius: "20px 20px 20px 20px" }}>
            <span className='text-white'><FontAwesomeIcon className="me-1" style={{ position: 'relative', top: '1px' }} icon={faMessage} /> <b>Chat</b></span>

            <div className='border rounded  overflow-auto bg-white mb-3 mt-3'>
              <ul ref={messagesRef} className='overflow-auto ps-3' style={{ height: '300px', maxWidth: '494px', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                <div className='text-black-50'>
                  {data.chat ? '' : 'No hay mensajes...'}
                </div>

                {data.chat && Object.values(data.chat)
                  .sort((a, b) => a.timestamp - b.timestamp) // ordenar por timestamp
                  .map((mensaje) => (
                    <div key={mensaje.message_id}>
                      <b style={{ color: mensaje.color }}>{mensaje.sender_username}: </b>
                      {mensaje.text}
                    </div>
                  ))
                }
              </ul>
            </div>

            <form onSubmit={mensajeChat}>
              <div className='row mx-0'>
                <div className='col ps-0 pe-1 justify-content-start align-items-center text-start '>
                  <input className="form-control fs-5 p-1 py-2" type="text" placeholder="Escribe tu mensaje" required maxLength={144} />
                </div>
                <div style={{minWidth:'112px'}} className='col-3 justify-content-end align-items-center text-end p-0'>
                  <button type='submit' className='btn btn-primary btn-lg '> Enviar <FontAwesomeIcon className="ms-1" style={{ position: 'relative', top: '2px' }} icon={faAngleRight} /> </button>
                </div>
              </div>
            </form>
          </div>
        </div>

      );
    }
    else if (!hasUserCookies) {
      return (
        <div>
          <div className='sub-container text-white mt-5 mb-3 pb-3 pt-3 px-3 fs-4 lh-lg'
            style={{ borderRadius: "20px 20px 20px 20px", height: 'fit-content' }}>
            <form onSubmit={unirsePartido}>

              <div className="input-group mt-2">
                  <input className="form-control border-2 fs-5 border-secondary" type='text' id='username' placeholder='Ingresa tu nombre' name='username' required onChange={handleChangeEvent} maxLength={15} />
                  <div className="input-group-append">
                      <span className="input-group-text h-100 border border-2 border-secondary rounded-0 rounded-end">{idLength}/15</span>
                  </div>
              </div>
              <div className="ms-2 text-light">{errorMessage}</div>
              <div className='mb-2 mt-2 pt-2 text-center'>
                  <button type='submit' disabled={isLoading} className='btn btn-primary border border-3 border-dark btn-lg bold' style={{ minWidth: '190px', height: '52px' }}>
                      {!isLoading
                          ? (
                              <div>
                                  Unirse <FontAwesomeIcon className="ms-1" style={{ position: 'relative', top: '1px' }} icon={faAngleRight} />
                              </div>
                          ) :
                          <div className="spinner-border text-dark" role="status">
                              <span className="sr-only">Loading...</span>
                          </div>
                      }
                  </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

  }
  else {
    return (
      <div className='text-center text-light fs-5'>
        <div className="spinner-border border-5 m-5" style={{ height: '150px', width: '150px' }} role="status"></div>
        <div>Cargando...</div>
      </div>
    );
  }

}

export default PartidoComponent;