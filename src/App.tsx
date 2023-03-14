import React, { useRef } from "react";
import { useState, useEffect, ChangeEvent } from "react";
import domToImage from 'dom-to-image';
import { saveAs } from 'file-saver';
import JsZip from 'jszip';

/**
 * 导入UI 组件库
 */

import { DownloadOutlined, UploadOutlined} from '@ant-design/icons';
import { Button, Pagination, Space, Radio} from 'antd';
import 'antd/dist/antd.css';

/**
 * 导入资源
 */
import './assets/css/index.css'

let border_image_list : string[] = [require('../src/assets/photo/black.png'), require('../src/assets/photo/white.png')]

const App = () => {
    const [border, setBorder] = useState(0); // 0 表示 黑色边框, 1 表示 白色边框
    const [image_list, setImageList] = useState([] as string[])
    const [name_list, setNameList] = useState([] as string[])
    const [image_index, setImageIndex] = useState(0) // 设置图片显示index
    const [blobs, setBlobs] = useState([] as any[])
    const [loading, setLoading] = useState(false); // 避免downLoading 按钮被点击太多次

    const inputRef = useRef<HTMLInputElement>(null)
    const phoneRef = useRef(null)

    useEffect(()=>{
        if(!loading) return
        if(image_index === image_list.length) {
            setImageIndex(0)
            setLoading(false)
            exportZip(blobs)
            return
        }
        cutPhoto()
    }, [image_index])

    const readPhoto = (e : ChangeEvent<HTMLInputElement>) => {
        try {
            const files = e.target?.files
            if(!files) {
                throw new Error("Upload FileList is null")
            }
            if(files.length !== 0) setImageList([])
            for (let i = 0; i < files.length; i++ ) {
                // 提取文件名字
                const reg = /(.*)\.(.*)/
                const file = files[i]
                if(!file.name.match(reg)) {
                    throw new Error("match name list is null")
                }
                setNameList(current => [...current, ((file.name.match(reg) as string[])[1]).trim()])
                //读取文件内容
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = e => {
                    setImageList(current => [...current, e.target?.result as string])
                };
            }
          } catch (error) {
            console.log(error)
          }
    }

    const uploadFiles = () => {
        inputRef.current?.click()
    }

    const getSingleBlobPng = () => {
        const node = phoneRef.current
        domToImage.toBlob(node).then((blob) => {
            saveAs(blob, `${name_list[image_index]}.png`)
        })
    }

    const getAllBlobPng = () => {
        setImageIndex(0)
        setLoading(true)
        setBlobs([])
        cutPhoto()
    }

    const cutPhoto = () => {
        domToImage.toBlob(phoneRef.current).then((blob) => {
            console.log('entering')
            setBlobs(current=>[...current, blob])
            setImageIndex(current=> current + 1)
        })
    }

    // 最终导出zip
    const exportZip = (res) => {
        const zip = JsZip();
        console.log(res)
        // 向zip中添加文件（二进制文件流）
        res.forEach((item, index) => {
            zip.file(`${name_list[index]}.png`, item);
        });
        // 异步生成zip，成功后下载zip
        zip.generateAsync({ type: 'blob' }).then((zipFile) =>{
            saveAs(zipFile, 'images.zip')
            setLoading(false);
        });
    };

    return (
        <div className = "content-wrapper">
            <div id="node" ref={phoneRef}>
                <div id="mobile-phone" style={{backgroundImage: 'url(' + border_image_list[border] + ')'}}>
                    <div className="shoot-photo" style={{backgroundImage: 'url(' + image_list[image_index] + ')'}}/>
                </div>
            </div>
            <div className="right">
                <div>
                    <span className="tip">phone border color: </span>
                    <Radio.Group onChange={e=>{setBorder(e.target.value)}} value={border} size="large">
                        <Radio.Button value={0}>black</Radio.Button>
                        <Radio.Button value={1}>white</Radio.Button>
                    </Radio.Group>
                </div>


                <Button type="primary" icon={<UploadOutlined/>} size="large" onClick={uploadFiles} style={{marginTop:40 + 'px'}}>
                    <input id="upload-photo" type='file' multiple onChange={readPhoto} ref={inputRef}/>
                    <span>Upload Picture</span>
                </Button>

                <Space style={{ width: '100%', marginTop: 40 + 'px' }}>
                    <Button type="primary" icon={<DownloadOutlined />}  onClick={getSingleBlobPng} size="large">
                        Download
                    </Button>
                    <Button type="primary" icon={<DownloadOutlined />}  onClick={getAllBlobPng} size="large" loading={loading}>
                        Download All
                    </Button>
                </Space>

                {
                    image_list.length > 1 ? (
                        <div style={{marginTop: 40 + 'px'}}>
                            <Pagination
                                current={image_index + 1}
                                total={image_list.length}
                                defaultPageSize={1}
                                onChange={page=>{setImageIndex(page-1)}}
                            />
                        </div>
                    ) : ''
                }
            </div>
	    </div>
    )
}

export default App
