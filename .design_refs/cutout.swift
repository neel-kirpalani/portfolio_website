// Isolates the foreground subject using Vision's on-device masking model and
// writes a PNG with a transparent background.
// Usage: swift cutout.swift <input> <output.png>
import Foundation
import Vision
import CoreImage

let args = CommandLine.arguments
guard args.count >= 3 else {
    FileHandle.standardError.write("usage: cutout <in> <out.png>\n".data(using: .utf8)!)
    exit(1)
}
let inURL = URL(fileURLWithPath: args[1])
let outURL = URL(fileURLWithPath: args[2])

guard let ciImage = CIImage(contentsOf: inURL) else {
    FileHandle.standardError.write("cannot read input\n".data(using: .utf8)!)
    exit(2)
}

let handler = VNImageRequestHandler(ciImage: ciImage, options: [:])
let request = VNGenerateForegroundInstanceMaskRequest()
do {
    try handler.perform([request])
} catch {
    FileHandle.standardError.write("request failed: \(error)\n".data(using: .utf8)!)
    exit(3)
}

guard let observation = request.results?.first else {
    FileHandle.standardError.write("no foreground found\n".data(using: .utf8)!)
    exit(4)
}

do {
    let buffer = try observation.generateMaskedImage(
        ofInstances: observation.allInstances,
        from: handler,
        croppedToInstancesExtent: false
    )
    let out = CIImage(cvPixelBuffer: buffer)
    let context = CIContext()
    guard let cs = CGColorSpace(name: CGColorSpace.sRGB) else { exit(6) }
    try context.writePNGRepresentation(of: out, to: outURL, format: .RGBA8, colorSpace: cs)
    print("wrote \(outURL.path)")
} catch {
    FileHandle.standardError.write("mask failed: \(error)\n".data(using: .utf8)!)
    exit(5)
}
