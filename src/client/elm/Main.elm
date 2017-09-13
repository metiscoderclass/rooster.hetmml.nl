module Main exposing (..)

-- import Html.Attributes exposing (..)
import Html exposing (..)
import Json.Decode exposing (string, Decoder)
import Json.Decode.Pipeline exposing (decode, required)


main : Program Flags Model msg
main =
    Html.programWithFlags
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }

type alias Flags = Json.Decode.Value


type alias Model =
    { users : List User
    }


type alias User =
    { type_ : String
    , value : String
    }


type UserType
    = Class
    | Teacher
    | Room
    | Student

init : Flags -> ( Model, Cmd msg )
init flags =
    case Json.Decode.decodeValue decodeUsers flags of
        Ok user ->
            (Model user, Cmd.none)

        Err err ->
            Debug.crash err

decodeUsers : Decoder (List User)
decodeUsers = Json.Decode.list decodeUser

decodeUser : Decoder User
decodeUser =
  decode User
    |> required "type" string
    |> required "value" string

update : msg -> Model -> (Model, Cmd msg)
update msg model = (model, Cmd.none)

view : Model -> Html msg
view model =
  text <| toString model

subscriptions : Model -> Sub msg
subscriptions model =
  Sub.none