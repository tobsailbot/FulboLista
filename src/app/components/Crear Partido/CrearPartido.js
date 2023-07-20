'use client'
require('dotenv').config();
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
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const writeToDatabase = (event) => {
        event.preventDefault();
        setIsLoading(true);
        const timestamp = new Date().getTime();
        const id = uid(5).toUpperCase();
        const user_id = uid(8);
        const partidoRef = ref(database, `partido/${id}`);
        let partido;
        set(partidoRef, {
            id: id,
            url: `/${id}`,
            lugar: "",
            fecha: "",
            hora: "",
            precio: 0,
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
                setErrorMessage('Error: ' + error.message);
                console.log('linea 1');

                console.log('linea 1',error.message);
                setIsLoading(false);
            });
        }).catch((error) => {
            setIsLoading(false);
        });
        return false;
    };

    // input ID onChange
    const [idLength, setIdLength] = useState(0);
    const alphanumericPattern = /^[a-zA-Z0-9]+$/;

    const handleChangeEvent = (event) => {
        setIdLength(event.target.value.length);
        if (event.target.value.length > 0) {
            if (alphanumericPattern.test(event.target.value)) {
                setErrorMessage("");
            }
            else{
                setErrorMessage("Esos caracteres no están permitidos 🙃");
            }
        }
    }

    // modal box
    const [show, setShow] = useState(false);
    const handleClose = () => { setShow(false), setIdLength(0), setErrorMessage('') };
    const handleShow = () => { setShow(true), setIdLength(0), setErrorMessage('') };

    return (
        <div className="text-center">

            <button className="main-btn btn border border-3 border-warning rounded-4 p-2 py-3 " onClick={handleShow}>
                <h3 className="text-center text-light mb-2">Crear Partido  <FontAwesomeIcon icon={faPersonRunning} height={24} />.</h3>
                <p className="text-center text-light px-4 mx-1 pt-1">
                    Organiza una nueva una sala personalizada.
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
                        <div className="input-group mt-2">
                            <input className="form-control border-2 fs-5 border-secondary" type='text' id='username' placeholder='Escribir aquí' name='username' required onChange={handleChangeEvent} maxLength={15} />
                            <div className="input-group-append">
                                <span className="input-group-text h-100 border border-2 border-secondary rounded-0 rounded-end">{idLength}/15</span>
                            </div>
                        </div>
                        <div className="ms-2 text-secondary">{errorMessage}</div>
                        <div className='mb-2 mt-2 pt-2 text-center'>
                            <button type='submit' disabled={isLoading} className='btn btn-warning border border-3 border-dark btn-lg bold px-4' style={{ minWidth: '190px', height: '52px' }}>
                                {!isLoading
                                    ? (
                                        <div>
                                            Crear Partido <FontAwesomeIcon className="ms-1" style={{ position: 'relative', top: '1px' }} icon={faAngleRight} />
                                        </div>
                                    ) :
                                    <div className="spinner-border text-dark" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                }
                            </button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>

        </div>
    );
}

export default CrearPartido