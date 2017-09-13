module DecodeFlags exposing (Flags, init)

import Json.Decode exposing (Decoder, andThen, decodeValue, fail, list, string, succeed)
import Json.Decode.Pipeline exposing (decode, required)
import Model exposing (..)


type alias Flags =
    Json.Decode.Value


init : Flags -> ( Model, Cmd msg )
init flags =
    case decodeValue decodeUsers flags of
        Ok user ->
            ( Model user, Cmd.none )

        Err err ->
            Debug.crash err


decodeUsers : Decoder (List User)
decodeUsers =
    list
        (decode User
            |> required "type" decodeUserType
            |> required "value" string
        )


decodeUserType : Decoder UserType
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
