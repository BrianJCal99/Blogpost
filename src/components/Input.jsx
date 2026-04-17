import React from 'react'

const Input = (props)=>{
    return (
    <div className="form-outline mb-4">
       <input className="form-control" name={props.name} type={props.type} placeholder={props.placeholder} onChange = {props.onChange}/>
    </div>
    )

}
export default Input