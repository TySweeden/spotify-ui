import React, { useContext, useState } from "react";
import ls from 'local-storage';
import { gql } from "apollo-boost";
import { useQuery, useLazyQuery } from "@apollo/react-hooks";
import RequestedTracksContext from '../../contexts/requestedTracksContext';
import _ from 'lodash';
import { useRouter } from 'next/router'
//import Link from 'next/link';
//import Router from 'next/router'

import { Card, List, Avatar, message, Col, Row, Checkbox } from 'antd';
import AudioControlButton from '../../components/audioControlButton';

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100)
        , seconds = parseInt((duration / 1000) % 60)
        , minutes = parseInt((duration / (1000 * 60)) % 60)
        , hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return parseInt(hours) > 0 ? hours + ":" + minutes + ":" + seconds : "" + minutes + ":" + seconds; // + "." + milliseconds;
}


function album() {
    const router = useRouter();
    const { id, trackId } = router.query;
    //const searchResultContext = useContext(SearchResultContext);
    const [selectedAlbumId, setSelectedAlbumId] = useState(id);
    const [albumTracks, setAlbumTracks] = useState({});

    const getAlbum = useQuery(
        gql`
        query GetAlbumById($id: String!) {
            getAlbumById(args: {id: $id}) {
                data {
                    artists {
                        href
                        id
                        name
                        type
                        uri
                    }
                    images {
                        width
                        height
                        url
                    }
                    href
                    id  
                    name
                    release_date
                    release_date_precision
                    total_tracks
                    type
                    uri
                }
            }
        }
        `,
        {
            variables: { id },
            fetchPolicy: "no-cache",
            onCompleted: data => {
                if (!data.getAlbumById) return;
                getAlbumTracks({ variables: { id: _.get(data.getAlbumById.data, "id") } });
            },
            onError: error => {
                console.log(error);
            }
        }
    );

    const [getAlbumTracks, getAlbumTracksVars] = useLazyQuery(
        gql`
            query GetAlbumTracks(
                $id: String!
            ) {
                getAlbumTracks(args: {id: $id, limit: 50}) {
                    data {
                        limit
                        total
                        items {
                            disc_number
                            duration_ms
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
                            artists {
                                href
                                id
                                name
                                type
                                uri
                            }
                        }
                    }
                }
            }

        `,
        {
            fetchPolicy: "no-cache",
            onCompleted: data => {
                if (!data.getAlbumTracks) return;
                console.log(data);

                var fetchedAlbumTracks = {};
                var existingAlbumTracks = _.cloneDeep(albumTracks);

                fetchedAlbumTracks[id] = data.getAlbumTracks.data.items
                setAlbumTracks(_.assign(existingAlbumTracks, fetchedAlbumTracks))

                if (trackId) {
                    setTimeout(() => {
                        var trackListItem = document.getElementById(trackId);
                        if (!trackListItem) return;


                        trackListItem.scrollIntoView(true);

                        setTimeout(() => {
                            if (!trackListItem) return;
                            trackListItem.classList.remove('flicker-event');
                        }, 0);

                        setTimeout(() => {
                            if (!trackListItem) return;
                            trackListItem.classList.add('flicker-event');
                            //trackListItem.scrollIntoView({ inline: "nearest" });

                            //trackListItem.click();
                        }, 120);


                    }, 500);
                }
            },
            onError: error => {
                console.log(error);
            }
        }
    )


    const {loading, requestedTracks, insertUserRequestedTrack, removeUserRequestedTrack} = useContext(RequestedTracksContext);

    const handleSelectedTrack = (e) => {
        e.preventDefault();
        if(!e.target.value) return;

        if(e.target.checked) {
            message.loading('Saving to playlist', 1.2).then(() =>
                insertUserRequestedTrack({
                    variables:{
                        trackId: e.target.value,
                        userId: ls.get("client-identifier"),
                        partyId: "somePartyId"
                    }
                })
            );
            
        } else {
            message.loading('Removing from playlist', 1.2).then(() => 
                removeUserRequestedTrack({
                    variables:{
                        trackId: e.target.value,
                        userId: ls.get("client-identifier"),
                        partyId: "somePartyId"
                    }
                })
            );
        }
    }
    
    return (
        <div>
            <Card
                loading={getAlbum.loading}
                className="album-view-card"
                bordered={false}
                cover={
                    getAlbum.data
                        ? _.has(getAlbum.data.getAlbumById.data, "images")
                            ? <img src={_.get(_.head(_.get(getAlbum.data.getAlbumById.data, "images")), "url")} />
                            : <Avatar size={411} shape="square" icon="user" />
                        : <Avatar size={411} shape="square" icon="user" />
                }
            >
                <Card.Meta
                    title={
                        getAlbum.data
                            ? _.get(getAlbum.data.getAlbumById.data, "name")
                            : null}
                    description={
                        getAlbum.data
                            ? _.has(getAlbum.data.getAlbumById.data, "genres")
                                ? _.join(getAlbum.data.getAlbumById.data, " • ")
                                : null
                            : null}
                />

                <List
                    itemLayout="horizontal"
                    loading={getAlbumTracksVars.loading}
                    dataSource={albumTracks ? albumTracks[selectedAlbumId] : []}
                    renderItem={item => (
                        <List.Item key={item.id} id={item.id}>
                            <Row gutter={2} justify="space-between" style={{ width: "100%" }}>
                                <Col span={2}>
                                    <Checkbox value={item.id} onChange={handleSelectedTrack} defaultChecked={_.findIndex(requestedTracks, {"trackId":item.id}) >= 0}/>
                                </Col>

                                <Col span={15}>
                                    {item.name}
                                </Col>

                                <Col span={4}>
                                    {msToTime(item.duration_ms)}
                                </Col>

                                <Col span={3}>
                                    <AudioControlButton size="small" disabled={!item.preview_url} audioId={item.id + "-audio"} src={item.preview_url} />
                                </Col>
                            </Row>
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    )
}

export default album;