import { useContext, useState, useEffect } from "react";
import { useQuery, useLazyQuery } from "@apollo/react-hooks";
import ls from 'local-storage';
import { gql } from "apollo-boost";
import RequestedTracksContext from '../../contexts/requestedTracksContext';

import _ from 'lodash';
import { useRouter } from 'next/router'


import { Card, List, Avatar, message, Collapse, Col, Row, Checkbox } from 'antd';
import AudioControlButton from '../../components/audioControlButton';
import bgImage from "../../resources/icons/great-scott-transparent.png";

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

const playlistTracksQuery = gql`
    query GetTracks(
        $ids: [String!]!
    ) {
        getTracks(args: {ids: $ids}) {
            data {
                disc_number
                duration_ms
                explicit
                href
                id
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
                album {
                    album_type
                    href
                    id
                    name
                    release_date
                    release_date_precision
                    total_tracks
                    type
                    uri
                    images {
                        height
                        width
                        url
                    }
                }
            }
        }
    }`;

function playlist() {
    const [tracks, setTracks] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [albumTracks, setAlbumTracks] = useState([]);
    const [fetchingTracks, setFetchingTracks] = useState(false);
    const { loading, requestedTracks, removeUserRequestedTrack } = useContext(RequestedTracksContext);

    const getTracksVars = useQuery(
        playlistTracksQuery,
        {
            variables: { ids: _.map(requestedTracks, "trackId") },
            fetchPolicy: "no-cache",
            onCompleted: data => {
                if (!data.getTracks) return;
                var tracks = _.cloneDeep(data.getTracks.data);
                if (!tracks) return;

                tracks = _.orderBy(tracks, ["track_number"], ["asc"]);


                var fetchedAlbumTracks = {};

                _.map(tracks, trackItem => {
                    fetchedAlbumTracks[trackItem.album.id] = fetchedAlbumTracks[trackItem.album.id] || []
                    fetchedAlbumTracks[trackItem.album.id].push(_.pull(trackItem, "artists", "album"))
                });

                setAlbums(_.uniqBy(_.orderBy(_.map(tracks, "album"), ["name", "id"], ["asc", "asc"]), "id"));
                setAlbumTracks(fetchedAlbumTracks);
            },
            onError: error => {
                console.log(error);
            }
        }
    )

    const handleSelectedTrack = (e) => {
        e.preventDefault();
        if (!e.target.value) return;


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

    const setPlaylistData = () => {
        if (requestedTracks.length <= 0) return;

        const savedTracks = _.map(requestedTracks, "trackId");

        var tracks = _.orderBy(_.filter(albumTracks, track => _.includes(savedTracks, track.id)), ["track_number"], ["asc"]);

        setAlbums(_.uniqBy(_.orderBy(_.map(tracks, "album"), ["name", "id"], ["asc", "asc"]), "id"));

        var fetchedAlbumTracks = {};
        //var existingAlbumTracks = _.cloneDeep(albumTracks);
        //_.assign(fetchedAlbumTracks, existingAlbumTracks);

        _.map(tracks, trackItem => {
            fetchedAlbumTracks[trackItem.album.id] = fetchedAlbumTracks[trackItem.album.id] || []
            fetchedAlbumTracks[trackItem.album.id].push(_.pull(trackItem, "artists", "album"))
        });

        setAlbumTracks(fetchedAlbumTracks)
    }

    const getPlaylistTracks = () => {
        setFetchingTracks(true);
        //getTracks({ variables: { ids: _.map(requestedTracks, "trackId") } })
    }

    //useEffect(getPlaylistTracks, [requestedTracks]);
    //useEffect(setPlaylistData, [requestedTracks]);


    return (
        <Card
            //loading={loading || getTracksVars.loading}
            className="album-view-card"
            bordered={false}
            cover={
                requestedTracks.length > 0
                    ? <div className="great-scott">
                        <img src={bgImage} alt="bg" style={{ width: "55%" }} />
                        <div className="great-scott-title" >Great Scott!</div>
                        <div className="great-scott-description">Your playlist is amazing!</div>
                    </div>
                    : <div className="great-scott">
                        <img src={bgImage} alt="bg" style={{ width: "55%" }} />
                        <div className="great-scott-title">Great Scott!</div>
                        <div className="great-scott-description">Your playlist is empty!</div>
                    </div>
            }
        >
            <Card.Meta
                title={""}
            />
            <List
                itemLayout="horizontal"
                loading={loading || getTracksVars.loading}
                dataSource={albums ? albums : []}
                renderItem={item => (
                    <Collapse
                        bordered={false}
                        expandIconPosition="right"
                        defaultActiveKey={_.map(albums, "id")}
                    //onChange={onCollapseItem}
                    >
                        <Collapse.Panel
                            key={item.id}
                            header={
                                <List.Item key={item.id} rowKey={item.id}>
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
                                loading={loading || getTracksVars.loading}
                            >
                                {_.map(albumTracks ? albumTracks[item.id] : [], item => 
                                    // inline map fixes issue with sub-elements not being removed upon removal from albumTracks state
                                    <List.Item key={item.id} rowKey={item.id}>
                                        <Row gutter={2} justify="space-between" style={{ width: "100%" }}>
                                            <Col span={2}>
                                                <Checkbox
                                                    value={item.id}
                                                    onChange={handleSelectedTrack}
                                                    defaultChecked={getTracksVars.data
                                                        ? _.findIndex(_.flatten(_.values(requestedTracks)), { "trackId": item.id }) >= 0
                                                        : false}
                                                />
                                            </Col>

                                            <Col span={15}>
                                                {item.track_number + " - " + item.name}
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

                            </List>

                        </Collapse.Panel>
                    </Collapse>
                )}
            />
        </Card>
    )
}

export default playlist;
