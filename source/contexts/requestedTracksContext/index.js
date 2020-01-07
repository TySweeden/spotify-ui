import React from 'react';
import { gql } from "apollo-boost";
import { useLazyQuery, useMutation, useSubscription } from "@apollo/react-hooks";

/*const [insertUserTrackRequestTracks] = useMutation(
    gql`
      mutation insert_userRequestPlaylistTracks(
        $trackId: String!
        $userId: String!
        $partyId: String!
      ) {
        insert_userRequestPlaylistTracks
        (
          objects: {
            trackId: $trackId
            userId: $userId
            partyId: $partyId
          }) {
          affected_rows
          returning {
            id
            partyId
            trackId
            userId
            createdAt
          }
        }
    }
    `,
    {
      onCompleted: data => {
        if (!data.insert_userRequestPlaylistTracks) return;
        console.log(_.first(data.insert_userRequestPlaylistTracks));
      },
      onError: error => {
        console.log(error);
      }
    }
  )*/

const RequestedTracksContext = React.createContext({loading: false, insertUserRequestedTrack: null, removeUserRequestedTrack: null});

export default RequestedTracksContext;