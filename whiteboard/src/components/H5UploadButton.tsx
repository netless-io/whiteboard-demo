import * as React from "react";
import {Button, Input, message, Popover, Upload, Card, Form, Progress, Spin} from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";
import OSS from "ali-oss";
import { v4 as uuidv4 } from "uuid";
import { Room } from "white-web-sdk";
import { h5OssConfigObj } from "../appToken";
import { history } from "../BrowserHistory";
import { WithTranslation } from "react-i18next";
import { Region } from "../region";

export type H5UploadButtonStates = {
    visible: boolean;
    fileList: File[];
    percent: number;
    startUpload: boolean;
    getSiteTimer: any;
    deploying: boolean,
};

export type H5UploadButtonProps = {
    room: Room;
    region: Region;
};

export class H5UploadButton extends React.Component<H5UploadButtonProps & WithTranslation, H5UploadButtonStates> {
    private oss: OSS;
    private prefix: string;

    constructor(props: H5UploadButtonProps & WithTranslation) {
        super(props);
        this.state = {
            visible: false,
            fileList: [],
            percent: 0,
            startUpload: false,
            getSiteTimer: null,
            deploying: false
        };
        const bucket = this.props.region === "us-sv" ? `${h5OssConfigObj.h5Bucket}-us` : h5OssConfigObj.h5Bucket
        let region = h5OssConfigObj.h5Region;
        this.prefix = h5OssConfigObj.h5Prefix;
        if (this.props.region && this.props.region !== "cn-hz") {
            region = "oss-us-west-1";
            this.prefix = h5OssConfigObj.h5PrefixUs;
        }

        this.oss = new OSS({
            accessKeyId: h5OssConfigObj.h5AccessKeyId,
            accessKeySecret: h5OssConfigObj.h5AccessKeySecret,
            bucket: bucket,
            region: region,
        });
    }

    componentWillUnmount() {
        if (this.state.getSiteTimer) {
            clearInterval(this.state.getSiteTimer);
        }
    }

    private onVisibleChange = (event: boolean): void => {
        if (event) {
            this.setState({visible: true});
        } else {
            this.setState({visible: false});
        }
    }

    private uploadFile = async (payload): Promise<void> => {
        const { t } = this.props;
        this.setState({ startUpload: true })
        const file = this.state.fileList[0];
        const uuid = uuidv4();
        const name = `${h5OssConfigObj.h5Folder}/${uuid}.zip`;
        try {
             await this.oss.multipartUpload(name, file, {
                progress: p => {
                    this.setState({ percent: Math.round(p * 100) });
                }
            })
            const siteUrl = `${this.prefix}${h5OssConfigObj.h5SiteFolder}/${uuid}`;
            this.setState({ deploying: true });
            await this.tryGetSite(payload, uuid, siteUrl);
        } catch (error) {
            console.log(error);
            message.error(`${t('upload-failed')}: ${JSON.stringify(error)}`,)
        }
    }

    private deploySuccess = async (payload, uuid: string, siteUrl: string) => {
        const { room } = this.props;
        this.setState({ getSiteTimer: null, deploying: false });
        this.makeScenes(room, `/${uuid}`);
        history.push(`${window.location.pathname}?h5Url=${encodeURIComponent(siteUrl)}&h5Dir=/${uuid}`);
        window.location.reload();
    }

    private tryGetSite = async (payload, uuid: string, siteUrl: string) => {
        const timer = setInterval(() => {
            fetch(siteUrl, {
                method: "get"
            }).then(res => {
                if (res.status === 200) {
                    clearInterval(timer);
                    this.deploySuccess(payload, uuid, siteUrl);
                }
            }).catch(err => {
                console.error(err)
            })
        }, 500);
        this.setState({ getSiteTimer: timer });
    }

    private makeScenes = (room: Room, dir: string) => {
        const scenes = room.entireScenes();
        if (!scenes[dir]) {
            room.putScenes(dir, this.createH5Scenes(1));
        }
        if (room.state.sceneState.contextPath !== dir) {
            room.setScenePath(dir);
        }
    }

    private createH5Scenes = (pageNumber: number) => {
        return new Array(pageNumber).fill(1).map((_, index) => ({ name: `${index + 1}` }));
    }

    private onFinish = async (values: any): Promise<void> => {
        await this.uploadFile(values);
    }

    private beforeUpload = file => {
        this.setState({
            fileList: [...this.state.fileList, file]
        });
        return false;
    }

    private renderForm = () => {
        const { t } = this.props;
        return (
            <Form labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} name="basic"
                onFinish={this.onFinish}>
                    <Form.Item
                        name="upload"
                        label={t('zip-file')}
                        valuePropName="fileList"
                        rules={[{ required: true }]}>
                        <Upload accept=".zip" name="upload" beforeUpload={this.beforeUpload}>
                            <Button block>{t('choose-file')}</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item wrapperCol={{ span: 12, offset: 8 }}>
                        <Button type="primary" htmlType="submit" block>
                            {t('submit')}
                        </Button>
                    </Form.Item>
                    {t('need')} <a href="https://github.com/netless-io/netless-iframe-bridge">
                netless-iframe-bridge
            </a> {t('to-sync')}

              </Form>
        )
    }

    private renderProgress = () => {
        const { t } = this.props;
        return (
            <div style={{ display: "flex", justifyContent: "center" }}>
                <Spin tip={t('upload-finished-loading')} spinning={this.state.deploying} size="large">
                    <Progress
                        type="circle"
                        strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                        }}
                        percent={this.state.percent}>
                    </Progress>
                </Spin>
            </div>
        )
    }

    renderContent() {
        const { t } = this.props;
        return (
            <Card style={{ width: "25rem" }} title={t('upload-h5-file')}>
              {this.state.startUpload ? this.renderProgress() : this.renderForm()}
            </Card>
        );
    }

    render(): React.ReactNode {
        return (
            <Popover
                visible={this.state.visible}
                onVisibleChange={this.onVisibleChange}
                trigger="click"
                placement={"bottomRight"}
                content={this.renderContent()}>
                <div className="page-preview-cell">
                    <CloudUploadOutlined style={{ fontSize: "14px" }} />
                </div>
            </Popover>
        )
    }
}
