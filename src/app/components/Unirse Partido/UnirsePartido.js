'use client'
require('dotenv').config();
import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPeopleGroup } from '@fortawesome/free-solid-svg-icons'
import { faAngleRight } from '@fortawesome/free-solid-svg-icons'
import firebaseConfig from "@/app/utils/Firebase/firebaseConfig";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Modal } from "react-bootstrap";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


/*
///// CAMBIOS 
En este componente UnirsePArtido, solo se le pide el id del partido
y se verifica si este id existe, si es asi se lo envia al PartidoComp  
*/

function UnirsePartido() {
    
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const unirsePartido = (event) => {
        setIsLoading(true);
        event.preventDefault();
        const id = event.target[0].value;

        // verificar si existe el partidocn esa ID
        get(ref(database, `partido/${id}`)).then((snapshot) => {
            const partido = snapshot.val();
            if (snapshot.exists()) {
                router.push(partido.url);
            }
            else {
                console.log('No existe el partido, ID incorrecta');
                setIsLoading(false);
            }
        }).catch((error) => {
            console.log('Error al obtener los datos del partido: ', error);
            setIsLoading(false);
        });
    };
    // input ID onChange
    const [event, getInputId] = useState('');
    const [idLength, setIdLength] = useState(0);
    
    const handleChangeEvent = (event) => {
        getInputId(event.target.value);
        setIdLength(event.target.value.length);
    }

    // modal box
    const [show, setShow] = useState(false);
    const handleClose = () => {setShow(false), setIdLength(0)};
    const handleShow = () => {setShow(true), setIdLength(0)};

    return (
        <div className="UnirsePartido">

            <button className="btn main-btn border border-3 rounded-4 p-2 py-3" style={{ border: 'rgb(215, 215, 215)' }} onClick={handleShow}>
                <h3 className="text-center text-light mb-2">Unirse <FontAwesomeIcon icon={faPeopleGroup} height={24} />.</h3>
                <p className="text-center text-light px-4 mx-1 pt-1">
                    Únete a un partido existente utilizando el ID proporcionado por el organizador.
                </p>
            </button>

            <Modal show={show} onHide={handleClose} style={{ marginTop: '150px' }}>
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title">
                        <label htmlFor='username'>Ingresa el ID:</label>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={unirsePartido}>
                        <div className="input-group">
                            <input type="text"  id='id' placeholder='Escribir aquí' name='id' required onChange={handleChangeEvent} maxLength={5} className="form-control border-2 fs-5 border-secondary" />
                            <div className="input-group-append">
                                <span className="input-group-text h-100 border border-2 border-secondary rounded-0 rounded-end">{idLength}/5</span>
                            </div>
                        </div>
                        <div className='mt-3 mb-2 text-center'>
                            <button type='submit' disabled={isLoading} className='btn btn-secondary border border-3 border-dark btn-lg bold px-4' style={{ minWidth: '190px', height: '52px' }}>
                            {!isLoading
                                    ? (
                                        <div>
                                            Unirse <FontAwesomeIcon className="ms-1" style={{ position: 'relative', top: '1px' }} icon={faAngleRight} />
                                        </div>
                                    ) :
                                    <div className="spinner-border text-light" role="status">
                                        <span className="sr-only"></span>
                                    </div>
                                }
                            </button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>

        </div>
    )
}


export default UnirsePartido;