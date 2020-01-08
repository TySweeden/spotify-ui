import { useState } from "react";
import { useRouter } from 'next/router';
import ls from 'local-storage'
import { gql } from "apollo-boost";
import { useLazyQuery, useMutation, useSubscription } from "@apollo/react-hooks";
import SearchResultContext from '../../contexts/searchResultContext';
import RequestedTracksContext from '../../contexts/requestedTracksContext';
import SearchInput from "../searchInput";
import _ from "lodash";

//import bgImage from "../../resources/icons/great-scott-transparent.png";
import { message } from 'antd';

//<SearchResultContext.Provider value={{artists:searchAllVars.data ? searchAllVars.data.searchAll.data : null}}>
//onPressEnter={(e) => searchAll({variables:{limit:10, name:e.target.value}})}
function MainContainer(props) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState();


  const onTrackRequestedInsert = () => {
    message
      .loading('Action in progress..', 2.5)
      .then(() => message.success('Loading finished', 2.5))
      .then(() => message.info('Loading finished is finished', 2.5));
  }

  const [searchAll, searchAllVars] = useLazyQuery(
    gql`
          query SearchAll(
            $limit: Int!
            $name: String!
          ) {
            searchAll(
              args: { limit: $limit, name: $name }
            ) {
              data {
                albums {
                  items {
                    id
                    name
                    type
                    release_date
                    release_date_precision
                    total_tracks
                    album_type
                    uri
                    href
                    images {
                      height
                      width
                      url
                    }
                    artists {
                      href
                      id
                      name
                      type
                      uri
                    }
                  }
                  href
                  limit
                  next
                  offset
                  previous
                  total
                }
                artists {
                  items {
                    id
                    name
                    images {
                      height
                      width
                      url
                    }
                    type
                    genres
                    popularity
                    href
                    uri
                  }
                  href
                  limit
                  next
                  offset
                  previous
                  total
                }
                tracks {
                  items {
                    album {
                      album_type
                      href
                      id
                      name
                      images {
                        height
                        width
                        url
                      }
                      release_date
                      release_date_precision
                      total_tracks
                      type
                      uri
                      artists {
                        href
                        id
                        name
                        type
                        uri
                      }
                    }
                    disc_number
                    duration_ms
                    explicit
                    href
                    id
                    is_local
                    is_playable
                    name
                    popularity
                    preview_url
                    track_number
                    type
                    uri
                  }
                  limit
                  next
                  offset
                  previous
                  total
                }
              }
            }
          }
        `,
    {
      //fetchPolicy: "no-cache",
      onCompleted: data => {
        if (!data.searchAll) return;
        //console.log(data);
      },
      onError: error => {
        console.log(error);
      }
    }
  );

  const userPlaylistVars = useSubscription(
    gql`
      subscription onUserRequestPlaylistUpdated(
        $userId: String!,
        $partyId: String!
      ) {
        userRequestPlaylistTracks(
          where: {userId: {_eq: $userId}, partyId: {_eq: $partyId}}) {
            id
            trackId
            userId
            partyId
            createdAt
        }
      }
    `,
    {
      onSubscriptionData: data => {
        console.log(data.subscriptionData);
        message.success('Playlist updated', 1.5);
      },
      onError: error => {
        console.log(error);
        message.error('Unable to reload user playlist', 3.5);
      },
      variables: {
        userId: ls.get("client-identifier"),
        partyId: "somePartyId", 
      }
    }
  )

  const [insertUserRequestedTrack] = useMutation(
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
        
        message.success('Saved to playlist', 1.2);
        //console.log(_.first(data.insert_userRequestPlaylistTracks));
      },
      onError: error => {
        console.log(error);
        message.error('Unable to update playlist', 3.5);
      }
    }
  )

  const [removeUserRequestedTrack] = useMutation(
    gql`
      mutation delete_userRequestPlaylistTracks(
        $trackId: String!
        $userId: String!
        $partyId: String!
      ) {
        delete_userRequestPlaylistTracks
        (
          where: {trackId: {_eq: $trackId}, userId: {_eq: $userId}, partyId: {_eq: $partyId}}
        ) {
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
        if (!data.delete_userRequestPlaylistTracks) return;
        
        message.success('Removed from playlist', 1.2);
        //console.log(_.first(data.delete_userRequestPlaylistTracks));
      },
      onError: error => {
        console.log(error);
        message.error('Unable to update playlist', 3.5);
      }
    }
  )

  const search = (e) => {
    !_.includes(router.pathname, "/search") ? router.push('/search') : null

    setSearchValue(e.target.value);
    e.target.value ? searchAll({ variables: { limit: 5, name: e.target.value } }) : null
  }

  return (
    <div>
      <SearchInput onChange={search} />

      <SearchResultContext.Provider
        value={
          {
            loading: searchAllVars.loading,
            search: searchValue,
            artists: {
              loading: searchAllVars.loading,
              data: searchAllVars.data ? searchAllVars.data.searchAll.data.artists : null
            },
            albums: {
              loading: searchAllVars.loading,
              data: searchAllVars.data ? searchAllVars.data.searchAll.data.albums : null
            },
            tracks: {
              loading: searchAllVars.loading,
              data: searchAllVars.data ? searchAllVars.data.searchAll.data.tracks : null
            }
          }
        }>
        <RequestedTracksContext.Provider 
          value={
            { 
              loading: userPlaylistVars.loading, 
              requestedTracks: userPlaylistVars.data ? userPlaylistVars.data.userRequestPlaylistTracks : [], 
              insertUserRequestedTrack,
              removeUserRequestedTrack
            }
        }>
          <div className="main-content-component">
            {props.children}
            {/*<div className="main-content-footer"></div>*/}
          </div>
        </RequestedTracksContext.Provider>
      </SearchResultContext.Provider>
    </div>
  )
}

export default MainContainer;