import * as React from "react";
import {Button, Input, message, Popover, Upload, Card, Form, Progress, Spin} from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";
import OSS from "ali-oss";
import { v4 as uuidv4 } from "uuid";
import { Room } from "white-web-sdk";
import { h5OssConfigObj } from "../appToken";
import { history } from "../BrowserHistory";

export type H5UploadButtonStates = {
    visable: boolean;
    fileList: File[];
    percent: number;
    startUpload: boolean;
    getSiteTimer: any;
    deploying: boolean,
};

export type H5UploadButtonProps = {
    room: Room
};

export class H5UploadButton extends React.Component<H5UploadButtonProps, H5UploadButtonStates> {
    private oss: OSS;

    constructor(props: H5UploadButtonProps) {
        super(props);
        this.state = {
            visable: false,
            fileList: [],
            percent: 0,
            startUpload: false,
            getSiteTimer: null,
            deploying: false
        };
        this.oss = new OSS({
            accessKeyId: h5OssConfigObj.h5AccessKeyId,
            accessKeySecret: h5OssConfigObj.h5AccessKeySecret,
            bucket: h5OssConfigObj.h5Bucket,
            region: h5OssConfigObj.h5Region,
        });
    }

    componentWillUnmount() {
        if (this.state.getSiteTimer) {
            clearInterval(this.state.getSiteTimer);
        }
    }
    
    private onVisibleChange = (event: boolean): void => {
        if (event) {
            this.setState({visable: true});
        } else {
            this.setState({visable: false});
        }
    }

    private uploadFile = async (payload) => {
        this.setState({ startUpload: true })
        const file = this.state.fileList[0];
        const uuid = uuidv4();
        const name = `${h5OssConfigObj.h5Folder}/${uuid}.zip`;
        try {
            const result = await this.oss.multipartUpload(name, file, { 
                progress: p => {
                    this.setState({ percent: Math.round(p * 100) });
                }
            })
            const siteUrl = `${h5OssConfigObj.h5Prefix}${h5OssConfigObj.h5SiteFolder}/${uuid}`;
            this.setState({ deploying: true });
            this.tryGetSite(payload, uuid, siteUrl);
        } catch (error) {
            console.log(error);
            message.error(`上传失败: ${JSON.stringify(error)}`,)
        }
    }

    private deploySuccess = async (payload, uuid: string, siteUrl: string) => {
        const { room } = this.props;
        this.setState({ getSiteTimer: null, deploying: false });
        this.makeScenes(room, `/${uuid}`, parseInt(payload.pageNumber));
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

    private makeScenes = (room: Room, dir: string, page: number) => {
        const scenes = room.entireScenes();
        if (!scenes[dir]) {
            room.putScenes(dir, this.createH5Scenes(page));
        }
        if (room.state.sceneState.contextPath !== dir) {
            room.setScenePath(dir);
        }
    }

    private createH5Scenes = (pageNumber: number) => {
        return new Array(pageNumber).fill(1).map((_, index) => ({ name: `${index + 1}` }));
    }
 
    private onFinish = (values: any) => {
        this.uploadFile(values);
    }

    private beforeUpload = file => {
        this.setState({
            fileList: [...this.state.fileList, file]
        });
        return false;
    }

    private renderForm = () => {
        return (
            <Form labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} name="basic"
                onFinish={this.onFinish}>
                    <Form.Item
                        name="upload"
                        label="压缩文件"
                        rules={[{ required: true }]}>
                        <Upload accept=".zip" name="uplpad" beforeUpload={this.beforeUpload}>
                            <Button block>选择文件</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item label="页数" name="pageNumber"
                        rules={[{ required: true }]}>
                        <Input type="number"></Input>
                    </Form.Item>
                    <Form.Item wrapperCol={{ span: 12, offset: 8 }}>
                        <Button type="primary" htmlType="submit" block>
                            提交
                        </Button>
                    </Form.Item>
              </Form>
        )
    }

    private renderProgress = () => {
        return (
            <div style={{ display: "flex", justifyContent: "center" }}>
                <Spin tip="上传完毕，部署中..." spinning={this.state.deploying} size="large">
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
        return (
            <Card style={{ width: "25rem" }} title="上传 H5 文件">
              {this.state.startUpload ? this.renderProgress() : this.renderForm()} 
            </Card>
        );
    }

    render(): React.ReactNode {
        return (
            <Popover
                visible={this.state.visable}
                onVisibleChange={this.onVisibleChange}
                trigger="click"
                placement={"bottomRight"}
                content={this.renderContent()}>
                <div className="page-controller-cell">
                    <CloudUploadOutlined style={{ fontSize: "1rem" }} />
                </div>
            </Popover>
        )
    }
}