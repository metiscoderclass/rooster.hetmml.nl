module Model exposing (..)


type alias Model =
    { users : List User
    }


type alias User =
    { type_ : UserType
    , value : String
    }


type UserType
    = Class
    | Teacher
    | Room
    | Student
