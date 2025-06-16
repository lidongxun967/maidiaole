import webview
import os
import sys

def main():
    webview.settings['ALLOW_DOWNLOADS'] = True
    
    # 处理资源路径（支持打包环境）
    if getattr(sys, 'frozen', False):
        # 打包环境：使用sys._MEIPASS目录
        base_path = sys._MEIPASS # type: ignore 
    else:
        # 开发环境：使用当前脚本目录
        base_path = os.path.dirname(os.path.abspath(__file__))
    
    # 使用web目录下的资源
    index_path = os.path.join(base_path, 'web', 'index.html')
    
    window = webview.create_window(
        title='卖掉了生成器',
        url=f'file:///{index_path}',
        width=1280,
        height=720
    )
    webview.start()

if __name__ == '__main__':
    main()