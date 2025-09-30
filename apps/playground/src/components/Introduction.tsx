export function Introduction() {
  return (
    <div className="text-center flex flex-col items-center gap-4 py-4 lg:py-20 px-4">
      <h1 className="text-7xl font-mondwest">Upload Website</h1>
      <p className="max-w-[530px] text-[#F7F7F7] mb-4 text-lg text-center font-montreal">
        Upload your website to Walrus, and display it on this page. This app is
        powered by the <b>Walrus TS SDK</b>, and <b>Site Builder SDK</b>. See
        the{' '}
        <a
          href="https://github.com/CommandOSSLabs/ts-sdks"
          className="text-[#C684F6] underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Site Builder SDK documentation
        </a>{' '}
        for more information. Find the source code{' '}
        <a
          href="https://github.com/CommandOSSLabs/ts-sdks"
          className="text-[#C684F6] underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          here.
        </a>
      </p>
    </div>
  )
}
