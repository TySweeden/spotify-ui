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
    }`;

// uses a local state to reduce calls to the server anytime the playlist is updated
function playlist() {
    const [albums, setAlbums] = useState([]);
    const [albumTracks, setAlbumTracks] = useState({});
    const [localLoading, setLocalLoading] = useState(false);
    const { loading, requestedTracks, removeUserRequestedTrack } = useContext(RequestedTracksContext);

    const [getTracks, getTracksVars] = useLazyQuery(
        playlistTracksQuery,
        {
            //variables: { ids: _.values(albumTracks) > 0 ? _.filter(_.map(requestedTracks, "trackId"), id => !_.includes(_.map(_.flatten(_.values(albumTracks)), "id"), id)) : _.map(requestedTracks, "trackId") },
            fetchPolicy: "no-cache",
            onCompleted: data => {
                if (!data.getTracks) return;
                
                var tracks = _.cloneDeep(data.getTracks.data);

                if (_.isUndefined(tracks) || _.isNull(tracks) || _.isNaN(tracks)) return;
                if (_.values(tracks) <= 0) return;

                tracks = _.orderBy(tracks, ["track_number"], ["asc"]);

                var fetchedAlbumTracks = {};
                _.assign(fetchedAlbumTracks, _.cloneDeep(albumTracks));
                
                _.map(tracks, trackItem => {
                    fetchedAlbumTracks[trackItem.album.id] = fetchedAlbumTracks[trackItem.album.id] || []
                    fetchedAlbumTracks[trackItem.album.id].push(_.pull(trackItem, "artists", "album"))
                });

                setAlbums(_.uniqBy(_.orderBy(_.concat( _.cloneDeep(albums), _.map(tracks, "album")), ["name", "id"], ["asc", "asc"]), "id"));
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

    const syncAddedTracks = () => {
        var existingIds = _.map(_.flatten(_.values(albumTracks)), "id");
        var contextIds = _.map(requestedTracks, "trackId"); 

        if(contextIds.length > existingIds.length) {
            var missingIds = _.filter(_.map(requestedTracks, "trackId"), id => !_.includes(_.map(_.flatten(_.values(albumTracks)), "id"), id))
            getTracks({variables: { ids: missingIds }})
        }
    }

    const syncRemovedTracks = () => {
        var existingIds = _.map(_.flatten(_.values(albumTracks)), "id");
        var contextIds = _.map(requestedTracks, "trackId");

        if(contextIds.length < existingIds.length) {
            var removedIds = _.filter(_.map(_.flatten(_.values(albumTracks)), "id"), id => !_.includes(_.map(requestedTracks, "trackId"), id));

            var existingAlbums = _.cloneDeep(albums);
            var existingAlbumTracks = _.cloneDeep(albumTracks);
            
            _.map(_.keys(existingAlbumTracks), albumId => {
                var tracks = existingAlbumTracks[albumId];
                _.remove(tracks, track => _.includes(removedIds, track.id))

                tracks.length > 0 ? existingAlbumTracks[albumId] = tracks : delete existingAlbumTracks[albumId];

                // if album has no tracks then remove album state
                !_.hasIn(existingAlbumTracks, albumId) ? _.remove(existingAlbums, album => album.id === albumId) : null;
            });

            !_.isEqual(albums, existingAlbums) ? setAlbums(existingAlbums) : null;
            !_.isEqual(albumTracks, existingAlbumTracks) ? setAlbumTracks(existingAlbumTracks) : null;
        }
    }

    useEffect(() => { 
        setLocalLoading(true);
        setTimeout(() => {
            syncAddedTracks();
            setLocalLoading(false);
        }, 200);
    }, [requestedTracks]);

    useEffect(() => { 
        setLocalLoading(true);
        setTimeout(() => {
            syncRemovedTracks();
            setLocalLoading(false);
        }, 200);
    }, [requestedTracks]);


    return (
        <Card
            className="album-view-card"
            bordered={false}
            cover={
                _.values(requestedTracks).length > 0
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
            <Card.Meta title={""} />
            <List
                itemLayout="horizontal"
                loading={loading || getTracksVars.loading || localLoading}
                dataSource={albums ? albums : []}
                renderItem={item => (
                    <Collapse
                        bordered={false}
                        expandIconPosition="right"
                        defaultActiveKey={_.map(albums, "id")}
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
                            <List itemLayout="horizontal" split={false}>
                                {_.map(albumTracks ? albumTracks[item.id] : [], item => 
                                    // inline map fixes issue with sub-elements not being removed upon removal from albumTracks state
                                    <List.Item key={item.id}>
                                        <Row gutter={2} justify="space-between" style={{ width: "100%" }}>
                                            <Col span={2}>
                                                <Checkbox
                                                    value={item.id}
                                                    onChange={handleSelectedTrack}
                                                    defaultChecked={getTracksVars.data
                                                        ? _.findIndex(requestedTracks, { "trackId": item.id }) >= 0
                                                        : false}
                                                />
                                            </Col>

                                            <Col span={15}>
                                                {item.name}
                                            </Col>

                                            <Col span={4} style={{paddingLeft:4}}>
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
