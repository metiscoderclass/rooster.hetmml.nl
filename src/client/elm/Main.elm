module Main exposing (..)

import Html exposing (..)
import Json.Decode exposing (Decoder, andThen, fail, string, succeed)
import Json.Decode.Pipeline exposing (decode, required)


main : Program Flags Model msg
main =
    Html.programWithFlags
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }


type alias Flags =
    Json.Decode.Value


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


init : Flags -> ( Model, Cmd msg )
init flags =
    case Json.Decode.decodeValue decodeUsers flags of
        Ok user ->
            ( Model user, Cmd.none )

        Err err ->
            Debug.crash err


decodeUsers : Decoder (List User)
decodeUsers =
    Json.Decode.list decodeUser


decodeUser : Decoder User
decodeUser =
    decode User
        |> required "type" decodeUserType
        |> required "value" string


decodeUserType : Json.Decode.Decoder UserType
decodeUserType =
    string
        |> andThen
            (\s ->
                case s of
                    "s" ->
                        succeed Student

                    "c" ->
                        succeed Class

                    "t" ->
                        succeed Teacher

                    "r" ->
                        succeed Room

                    _ ->
                        fail ("What the f*ck is " ++ s ++ "?")
            )


update : msg -> Model -> ( Model, Cmd msg )
update msg model =
    ( model, Cmd.none )


view : Model -> Html msg
view model =
    text <| toString model


subscriptions : Model -> Sub msg
subscriptions model =
    Sub.none
