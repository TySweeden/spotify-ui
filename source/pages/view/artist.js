import React, { useContext, useState, useEffect } from "react";
import ls from 'local-storage'
import { gql } from "apollo-boost";
import { useQuery, useLazyQuery } from "@apollo/react-hooks";
import RequestedTracksContext from '../../contexts/requestedTracksContext';
import _ from 'lodash';
import { useRouter } from 'next/router'
//import Link from 'next/link';
//import Router from 'next/router'

import { Card, List, Avatar, message, Collapse, Col, Row, Checkbox } from 'antd';
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

function artist() {
    const router = useRouter();
    const { id } = router.query;
    //const searchResultContext = useContext(SearchResultContext);
    const [selectedAlbumId, setSelectedAlbumId] = useState();
    const [albumTracks, setAlbumTracks] = useState({});
    const [localLoading, setLocalLoading] = useState(false);
    const { loading, requestedTracks, insertUserRequestedTrack, removeUserRequestedTrack } = useContext(RequestedTracksContext);

    const getArtist = useQuery(
        gql`
        query GetArtistById($id: String!) {
            getArtistById(args: {id: $id}) {
                data {
                    genres
                    href
                    id
                    name
                    popularity
                    type
                    uri
                    images {
                        height
                        width
                        url
                    }
                    followers {
                        total
                    }
                }
            }
        }
        `,
        {
            variables: { id },
            //fetchPolicy: "no-cache",
            onCompleted: data => {
                if (!data.getArtistById) return;
                getArtistAlbums({ variables: { id: _.get(data.getArtistById.data, "id") } });
            },
            onError: error => {
                console.log(error);
            }
        }
    );

    // pass limit ! defaults to 20
    const [getArtistAlbums, getArtistAlbumsVars] = useLazyQuery(
        gql`
              query GetArtistAlbums(
                $id: String!
              ) {
                getArtistAlbums(
                  args: { id: $id }
                ) {
                    data {
                        href
                        limit
                        total
                        items {
                            album_type
                            href
                            id
                            name
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
                            images {
                                height
                                width
                                url
                            }
                        }
                    }
                }
              }
            `,
        {
            //fetchPolicy: "no-cache",
            onCompleted: data => {
                if (!data.getArtistAlbums) return;
                //console.log(data);
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
            //fetchPolicy: "no-cache",
            onCompleted: data => {
                if (!data.getAlbumTracks) return;
                console.log(data);

                var fetchedAlbumTracks = {};
                var existingAlbumTracks = _.cloneDeep(albumTracks);

                fetchedAlbumTracks[selectedAlbumId] = data.getAlbumTracks.data.items
                setAlbumTracks(_.assign(existingAlbumTracks, fetchedAlbumTracks))
            },
            onError: error => {
                console.log(error);
            }
        }
    )

    const onCollapseItem = (key) => {
        const albumId = _.head(key);
        if (!albumId) return;

        setTimeout(() => {
            setSelectedAlbumId(albumId);
            getAlbumTracks({ variables: { id: albumId } });
        }, 400)
    }

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
        <div>
            <Card
                //loading={getArtist.loading}
                className="artist-view-card"
                bordered={false}
                cover={
                    getArtist.data
                        ? _.has(getArtist.data.getArtistById.data, "images")
                            ? <img src={_.get(_.head(_.get(getArtist.data.getArtistById.data, "images")), "url")} />
                            : <Avatar size={411} shape="square" icon="user" />
                        : <Avatar size={411} shape="square" icon="user" />
                }
            >
                <Card.Meta
                    title={
                        getArtist.data
                            ? _.get(getArtist.data.getArtistById.data, "name")
                            : null}
                    description={
                        getArtist.data
                            ? _.has(getArtist.data.getArtistById.data, "genres")
                                ? _.join(getArtist.data.getArtistById.data.genres, " • ")
                                : null
                            : null}
                />
                <List
                    itemLayout="horizontal"
                    loading={getArtistAlbumsVars.loading || localLoading}
                    dataSource={getArtistAlbumsVars.data ? getArtistAlbumsVars.data.getArtistAlbums.data.items : []}
                    renderItem={item => (
                        <Collapse
                            bordered={false}
                            expandIconPosition="right"
                            onChange={onCollapseItem}
                        >
                            <Collapse.Panel
                                key={item.id}
                                header={
                                    <List.Item key={item.id}>
                                        <div className="artist-album-item">
                                            <List.Item.Meta
                                                title={item.name}
                                                avatar={_.get(_.head(item.images), "url")
                                                    ? <Avatar size={80} shape="square" src={_.get(_.head(item.images), "url")} />
                                                    : <Avatar size={80} shape="square" icon="user" />}
                                                description={
                                                    item.type === "album" && _.get(item, "artists")
                                                        ? item.type + " • " + _.join(_.map(item.artists, "name"), " • ")
                                                        : item.type}
                                            />
                                        </div>
                                    </List.Item>}>
                                <List
                                    itemLayout="horizontal"
                                    loading={getAlbumTracksVars.loading || localLoading}
                                    dataSource={albumTracks ? albumTracks[item.id] : []}
                                    renderItem={track => 
                                        <List.Item key={track.id}>
                                        <Row gutter={2} justify="space-between" style={{ width: "100%" }}>
                                            <Col span={2}>
                                                <Checkbox value={track.id} onChange={handleSelectedTrack} defaultChecked={_.findIndex(requestedTracks, { "trackId": track.id }) >= 0} />
                                            </Col>

                                            <Col span={15}>
                                                {track.name}
                                            </Col>

                                            <Col span={4}>
                                                {msToTime(track.duration_ms)}
                                            </Col>

                                            <Col span={3}>
                                                <AudioControlButton size="small" disabled={!track.preview_url} audioId={track.id + "-audio"} src={track.preview_url} />
                                            </Col>
                                        </Row>
                                    </List.Item>}
                                />

                            </Collapse.Panel>
                        </Collapse>
                    )}
                />
            </Card>
        </div>
    );
}

export default artist;