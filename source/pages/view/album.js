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
    const [localLoading, setLocalLoading] = useState(false);
    const { loading, requestedTracks, insertUserRequestedTrack, removeUserRequestedTrack } = useContext(RequestedTracksContext);

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

    const handleSelectedTrack = (e) => {
        e.preventDefault();
        if (!e.target.value) return;

        if (e.target.checked) {
            message.loading('Saving to playlist', 1.2).then(() =>
                insertUserRequestedTrack({
                    variables: {
                        trackId: e.target.value,
                        userId: ls.get("client-identifier"),
                        partyId: "somePartyId"
                    }
                })
            );

        } else {
            message.loading('Removing from playlist', 1.2).then(() =>
                removeUserRequestedTrack({
                    variables: {
                        trackId: e.target.value,
                        userId: ls.get("client-identifier"),
                        partyId: "somePartyId"
                    }
                })
            );
        }
    }

    return (
        <Row gutter={16} layout="flex" justify="space-between" style={{ zIndex: 1 }}>
            <Col
                xs={{ span: 24 }}
                sm={{ span: 24 }}
                md={{ span: 24 }}
                lg={{ span: 24 }}
                xl={{ span: 24 }}
                xxl={{ span: 24 }}
            >
                <Card
                    //loading={getAlbum.loading}
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
                        grid={{
                            gutter: 0,
                            xs: 1,
                            sm: 1,
                            md: 2,
                            lg: 2,
                            xl: 2,
                            xxl: 2
                        }}
                        itemLayout="horizontal"
                        loading={getAlbumTracksVars.loading}
                        dataSource={albumTracks ? albumTracks[selectedAlbumId] : []}
                        renderItem={item => (
                            <List.Item key={item.id} id={item.id}>
                                <Row gutter={2} justify="space-between" style={{ width: "100%" }}>
                                    <Col 
                                        xs={{ span: 2 }}
                                        sm={{ span: 2 }}
                                        md={{ span: 2 }}
                                        lg={{ span: 2 }}
                                        xl={{ span: 1 }}
                                        xxl={{ span: 1 }}
                                    >
                                        <Checkbox value={item.id} onChange={handleSelectedTrack} defaultChecked={_.findIndex(requestedTracks, { "trackId": item.id }) >= 0} />
                                    </Col>

                                    <Col
                                        xs={{ span: 15 }}
                                        sm={{ span: 15 }}
                                        md={{ span: 15 }}
                                        lg={{ span: 15 }}
                                        xl={{ span: 8 }}
                                        xxl={{ span: 8 }}
                                    >
                                        {item.name}
                                    </Col>

                                    <Col
                                        xs={{ span: 4 }}
                                        sm={{ span: 4 }}
                                        md={{ span: 4 }}
                                        lg={{ span: 4 }}
                                        xl={{ span: 3 }}
                                        xxl={{ span: 1 }}
                                    >
                                        {msToTime(item.duration_ms)}
                                    </Col>

                                    <Col
                                        xs={{ span: 3 }}
                                        sm={{ span: 3 }}
                                        md={{ span: 3 }}
                                        lg={{ span: 1 }}
                                        xl={{ span: 1 }}
                                        xxl={{ span: 1 }}
                                    >
                                        <AudioControlButton size="small" disabled={!item.preview_url} audioId={item.id + "-audio"} src={item.preview_url} />
                                    </Col>
                                </Row>
                            </List.Item>
                        )}
                    />
                </Card>
            </Col>
        </Row>
    )
}

export default album;