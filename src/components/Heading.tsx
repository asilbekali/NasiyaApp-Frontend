import type { FC } from "react"
import type { HeadingType } from "../@types/HeadingType"

const Heading:FC<HeadingType> = ({classList, children, tag}) => {
  if(tag == "h1"){
    return <h1 className={`font-bold text-[24px] ${classList}`}>{children}</h1>
  }
  else if(tag == "h2"){
    return <h1 className={`font-semibold text-[16px] ${classList}`}>{children}</h1>
  }
  else if(tag == "h3"){
    return <h1 className={`font-semibold text-[14px] ${classList}`}>{children}</h1>
  }
}

export default Heading