import React from 'react'
const Button = (props) =>{
    return (
        <div className="text-center">
            <button className="btn btn-primary btn-block mb-4" type = {props.type} onClick = {props.onClick}> {props.text} </button>
        </div>
    )
}
export default Button