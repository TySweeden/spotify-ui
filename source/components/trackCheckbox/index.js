import { gql } from "apollo-boost";
import { useLazyQuery, useMutation, useSubscription } from "@apollo/react-hooks";
import { Checkbox } from 'antd';

function TrackCheckbox(props) {

    const [insertUserTrackRequestTracks] = useMutation(
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
                if (!data.insert_receipts) return;
                console.log(_.first(data.insert_receipts.returning));
                setReceiptForm(_.first(data.insert_receipts.returning))
            },
            onError: error => {
                console.log(error);
            }
        }
    )
    const handleChecked = (e) => {
        e.preventDefault()
        console.log(e.target.value);
    }

    return <Checkbox onChange={handleChecked} value={props.trackId} />
}

export default TrackCheckbox;