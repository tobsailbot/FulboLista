'use client'
import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPersonRunning } from '@fortawesome/free-solid-svg-icons'
import { faAngleRight } from '@fortawesome/free-solid-svg-icons'
import firebaseConfig from "@/app/utils/Firebase/firebaseConfig";
import { uid } from 'uid';
import Cookies from 'js-cookie';
import { useState } from "react";
import { Modal } from "react-bootstrap";
import { useRouter } from 'next/navigation';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function CrearPartido() {

    const router = useRouter();
    const writeToDatabase = (event) => {
        event.preventDefault();
        const timestamp = new Date().getTime();
        const id = uid(8);
        const user_id = uid(8);
        const partidoRef = ref(database, `partido/${id}`);
        let partido;
        set(partidoRef, {
            id: id,
            url: `/${id}`,
            lugar: "",
            fecha: "",
            hora: "",
            precio: null,
            alquilado: false,
            usuarios: {
                [user_id]: {
                    "user_id": user_id,
                    "username": event.target[0].value,
                    "color": "#FF0000",
                    "is_admin": true,
                    "order": timestamp,
                    "equipo": 0,
                    "positionX": 0,
                    "positionY": 0
                }
            }
        }).then(() => {
            console.log('Los datos se han escrito correctamente');
            get(partidoRef).then((snapshot) => {
                partido = snapshot.val();
                console.log('Partido creado correctamente: ', partido);
                // crear cookie con id del  partido y usuario
                Cookies.set(id, user_id, { expires: 60 });
                // redirigir al PartidoComponent
                router.push(partido.url);
            }).catch((error) => {
                console.error('Error al obtener los datos del partido: ', error);
            });
        }).catch((error) => {
            console.error('Error al escribir los datos: ', error.message);
        });
        return false;
    };

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <div className="CrearPartido">

            <button className="main-btn btn border border-3 border-warning rounded-4 p-2 py-3 " onClick={handleShow}>
                <h3 className="text-center text-light mb-2">Crear Partido  <FontAwesomeIcon icon={faPersonRunning} height={24} />.</h3>
                <p className="text-center text-light px-4 mx-1 pt-1">
                    Configura una sala personalizada para invitar a otros jugadores y formar equipos!
                </p>
            </button>


            <Modal show={show} onHide={handleClose} style={{ marginTop: '150px' }}>
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title">
                        <label htmlFor='username'>Ingresa tu nombre:</label>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={writeToDatabase}>
                        <input className='form-control-lg my-2 w-100' type='text' id='username' placeholder='Escribir aquí' name='username' required />
                        <div className='mt-3 mb-2 text-center'>
                            <button type='submit' className='btn btn-warning border border-3 border-dark btn-lg bold px-4'>Crear Partido <FontAwesomeIcon className="ms-1" style={{ position: 'relative', top: '1px' }} icon={faAngleRight} /> </button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>

        </div>
    );
}

export default CrearPartido