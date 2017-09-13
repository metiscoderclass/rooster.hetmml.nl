module Main exposing (..)

import Html exposing (..)
import Model exposing (Model)
import DecodeFlags exposing (Flags, init)

main : Program Flags Model msg
main =
    Html.programWithFlags
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }

update : msg -> Model -> ( Model, Cmd msg )
update msg model =
    ( model, Cmd.none )


view : Model -> Html msg
view model =
    text <| toString model


subscriptions : Model -> Sub msg
subscriptions model =
    Sub.none
