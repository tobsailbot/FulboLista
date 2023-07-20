import PartidoComponent from "../components/Partido Component/PartidoComponent"

export default function Page({params:{id}}){
    return(
        <PartidoComponent id={id} />
    )
}

